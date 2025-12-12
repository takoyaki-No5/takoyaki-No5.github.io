import {format_view_count, parse_duration} from "./func.js";
export const all_items=[];
export let display_items=[];

//const CHANNEL_ID = "UCFz1nNoqzgfM-OhmhuI1fYg";
const API_KEY = "AIzaSyC32k1f-L-HgWX7vZjHnPGTP-TnKa4eZtY";            
const PLAYLIST_ID = "PLg_Vllr2X7mKpLGkxsHPQe7NwIyLZ6fF5"
let player;
let idx=0;
let is_playing=false //playerがエラーで止まったときなどに使うので自前の変数で管理

export const create_list=()=>{
    const video_list=document.getElementById("videoList");
    video_list.innerHTML="";
    display_items.forEach((item,i)=>{
        const li=document.createElement("li");
        li.dataset.index=i;
        const div=document.createElement("div");
        const title=document.createElement("span");
        const view_count=document.createElement("span");
        const img=document.createElement("img");
        const index=document.createElement("span");
        
        title.textContent=item.snippet.title;
        view_count.textContent=`${format_view_count(item.viewCount)}`;
        div.appendChild(title)
        div.appendChild(view_count)
        img.src=item.snippet?.thumbnails?.default?.url ?? null;
        index.textContent=i+1;
        li.appendChild(index);
        li.appendChild(img);
        li.appendChild(div);
        video_list.appendChild(li);
    });
    idx = 0;
    if(player && display_items.length > 0){
        player.cueVideoById(display_items[idx].snippet.resourceId.videoId);
    }
}

const load=async()=> {
    let next_page_token ="";
    const max_results=10;
    do{
        const url=`https://www.googleapis.com/youtube/v3/playlistItems?` + `part=snippet&playlistId=${PLAYLIST_ID}&maxResults=${max_results}&key=${API_KEY}`+
            (next_page_token ? `&pageToken=${next_page_token}`:"");
        const res = await fetch(url);
        const data = await res.json();
        all_items.push(...data.items);
        next_page_token = data.nextPageToken;
    //}while(next_page_token);
    }while(false);
    
    let all_video_ids=all_items.map(item=>item.snippet.resourceId.videoId)
    
    const chunk_size=50;
    let video_datas=[]
    for(let i=0;i<all_video_ids.length;i+=chunk_size){
        const chunk=all_video_ids.slice(i,i+chunk_size).join(",");
        const url=`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${chunk}&key=${API_KEY}`
        const res=await fetch(url);
        const data =await res.json();
        video_datas.push(...data.items);
    }
    let j=0;
    for(let i=0;i<all_items.length;i++){
        const item=all_items[i];
        const title = item.snippet.title;
        const thumbs = item.snippet.thumbnails;
        if(!thumbs || ["Deleted video", "Private video", "Unavailable video"].includes(title)){
            item.duration=0;
            j++;
        }else{
            item.viewCount=Number(video_datas[i-j].statistics.viewCount);
            item.duration=parse_duration(video_datas[i-j].contentDetails.duration);
        }
       
    }
    display_items=[...all_items];
    create_list();
    console.log(display_items)
}

const initPlayer=()=>{
    if(!display_items || display_items.length===0){
        console.error("動画データが揃っていません");
        return;
    }

    const highLightCurrentVideo=(idx)=>{
        const lis = document.querySelectorAll("#videoList li");
        lis.forEach((li, i) => {
            li.classList.toggle("current", i === idx);
        });
    }
    
    function onPlayerError(event){
        console.warn("動画再生エラー:", event.data, "idx:", idx);
        // エラーが出たら次の動画へ
        idx++;
        if(idx < display_items.length){
            if(is_playing){
                player.loadVideoById(display_items[idx].snippet.resourceId.videoId);
            }else{
                player.cueVideoById(display_items[idx].snippet.resourceId.videoId);
            }
        }
    }
    
    function onPlayerStateChange(event){
        if(event.data===YT.PlayerState.PLAYING){
            highLightCurrentVideo(idx);
            is_playing=true;
        }
        if(event.data===YT.PlayerState.PAUSED){
            is_playing=false;
        }
        if(event.data===YT.PlayerState.ENDED){
            idx++;
            if(idx<display_items.length){
                player.loadVideoById(display_items[idx].snippet.resourceId.videoId);
            }else{
                console.log("全部再生しました");
            }
        }
    }
    
    player=new YT.Player('player',{
        width:640,
        height:360,
        videoId:display_items[idx].snippet.resourceId.videoId,
        playerVars:{
            autoplay:0,
            controls:1,
        },
        events:{
            'onStateChange':onPlayerStateChange,
            'onError':onPlayerError
        }
    });
}

// IFrame API が ready になったら initPlayer を呼ぶ
const waitForYouTubeAPI = () => {
    return new Promise(resolve => {
        if (window.YT && YT.Player) resolve();
        else window.onYouTubeIframeAPIReady = () => resolve();
    });
}

const loader=document.getElementById("loader");
const initApp = async () => {
    loader.hidden=false;
    await load();                
    await waitForYouTubeAPI();   
    initPlayer();                
    loader.hidden=true;
}

initApp();

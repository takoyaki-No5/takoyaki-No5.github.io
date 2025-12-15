import {format_view_count, parse_duration, request_by_playlist_id} from "./func.js";
export let all_items=[];
export let display_items=[];

//const CHANNEL_ID = "UCFz1nNoqzgfM-OhmhuI1fYg";
export const API_KEY = "AIzaSyC32k1f-L-HgWX7vZjHnPGTP-TnKa4eZtY";            
const DEFAULT_PLAYLIST_ID = "PLg_Vllr2X7mKpLGkxsHPQe7NwIyLZ6fF5" 
let player;
let idx=0;
let is_playing=false //playerがエラーで止まったときなどに使うので自前の変数で管理
const params = new URLSearchParams(location.search);
const playlist_id = params.get("Id") || DEFAULT_PLAYLIST_ID;


export const create_list=()=>{
    const video_list=document.getElementById("videoList");
    video_list.innerHTML="";
    display_items.forEach((item,i)=>{
        const li=document.createElement("li");
        li.dataset.index=i;
        const div=document.createElement("div");
        const title=document.createElement("span");
        const channel_name_and_view_count=document.createElement("span");
        const img=document.createElement("img");
        const index=document.createElement("span");
        
        title.textContent=item.snippet.title;
        channel_name_and_view_count.textContent=`${item.snippet.videoOwnerChannelTitle}・${format_view_count(item.viewCount)}`;
        channel_name_and_view_count.classList.add("channel-title-and-view-count");
        div.appendChild(title)
        div.appendChild(channel_name_and_view_count)
        img.src=item.snippet?.thumbnails?.medium?.url ?? null;
        index.textContent=i+1;
        li.appendChild(index);
        li.appendChild(img);
        li.appendChild(div);
        video_list.appendChild(li);

        li.addEventListener("click", () => {
            idx = parseInt(li.dataset.index);
            loadVideo(); 
        });
    });
    idx = 0;
    if(player && display_items.length > 0){
        loadVideo(true);
    }
}

const YT_player=document.getElementById("player");
const loader=document.getElementById("loader");
export const load=async(playlist_id)=> {
    const id_error=document.getElementById("idError");
    let playlist_data=null;
    try {
        playlist_data=await request_by_playlist_id(playlist_id,API_KEY);
    } catch (error) {
        id_error.hidden=false;
        return;
    }
    
    if(!playlist_data.items || playlist_data.items.length===0){
        id_error.hidden=false;
        return;
    }else{
        id_error.hidden=true;
    }
    YT_player.hidden=true;
    loader.hidden=false;
    await new Promise(requestAnimationFrame);
    document.getElementById("playlistId").value=playlist_id;
    const url = new URL(window.location);
    url.searchParams.set("Id",playlist_id);
    if(playlist_id===DEFAULT_PLAYLIST_ID){
        history.replaceState(null, "", url);
    }else{
        history.pushState(null,"",url);
    }
    
    document.getElementById("playlistTitle").textContent=playlist_data.items[0].snippet.title;

    let next_page_token ="";
    const max_results=50;
    all_items=[];
    do{
        const url=`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist_id}&maxResults=${max_results}&key=${API_KEY}`+
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
    YT_player.hidden=false;
    loader.hidden=true;
}

const highLightCurrentVideo = () => {
    const videoList = document.getElementById("videoList");
    const lis = videoList.querySelectorAll("li");
    lis.forEach((li, i) => {
        const videoIndex = li.querySelector("span"); 
        const isCurrent = i === idx;
        li.classList.toggle("current", isCurrent);
        videoIndex.textContent = isCurrent ? "▶" : (i + 1);
    });

    const currentLi = videoList.querySelector("li.current");
    const liRect = currentLi.getBoundingClientRect();
    const ulRect = videoList.getBoundingClientRect();
    if (currentLi) {
        videoList.scrollTo({
            top: videoList.scrollTop + (liRect.top - ulRect.top)-1,
            behavior: 'smooth'
        });
    }
};

const video_info=document.getElementById("video-info");
function updateVideoInfo() {
    video_info.innerHTML = "";

    const title = document.createElement("span");
    const channel_name_and_view_count = document.createElement("span");
    channel_name_and_view_count.classList.add("channel-title-and-view-count");

    title.textContent = display_items[idx].snippet.title;
    channel_name_and_view_count.textContent = `${display_items[idx].snippet.videoOwnerChannelTitle}・${format_view_count(display_items[idx].viewCount)}`;

    video_info.appendChild(title);
    video_info.appendChild(channel_name_and_view_count);
}

function loadVideo(cue=false) {
    if(cue){
        const videoList = document.getElementById("videoList");
        const currentLi = videoList.querySelector("li.current");
        if(currentLi){
            currentLi.classList.toggle("current");
            currentLi.querySelector("span").textContent = idx;
        }
        player.cueVideoById(display_items[idx].snippet.resourceId.videoId);
    }else{
        player.loadVideoById(display_items[idx].snippet.resourceId.videoId);
        highLightCurrentVideo();
    }
    updateVideoInfo(); 
}

const initPlayer=()=>{
    if(!display_items || display_items.length===0){
        console.error("動画データが揃っていません");
        return;
    }

    function onPlayerError(event){
        console.warn("動画再生エラー:", event.data, "idx:", idx);
        // エラーが出たら次の動画へ
        idx++;
        if(idx < display_items.length){
            if(is_playing){
                loadVideo();
            }else{
                console.log(is_playing);
                loadVideo(true);
            }
        }
    }
    
    function onPlayerStateChange(event){
        if(event.data===YT.PlayerState.PLAYING){
            highLightCurrentVideo();
            is_playing=true;
            console.log("true")
        }
        if(event.data===YT.PlayerState.PAUSED){
            is_playing=false;
            console.log("true")
        }
        if(event.data===YT.PlayerState.ENDED){
            idx++;
            if(idx<display_items.length){
                loadVideo();
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

const initApp = async () => {
    await load(playlist_id);                
    await waitForYouTubeAPI();   
    initPlayer();                
    updateVideoInfo(); 
}

initApp();
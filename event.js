import { sec_to_our_min, shuffleArray } from "./func.js";
import { create_list, all_items,display_items, load } from "./load.js";
import { compare_position_at,compare_view_count,sort,dp } from "./algorithm.js";

const handle_sort=(event)=>{
    const value=event.target.value;
    switch (value) {
    case "default":
        display_items.splice(0,display_items.length,...all_items);
        break;
    case "positionDesc":
        sort(display_items, compare_position_at);
        break;
    case "positionAsc":
        sort(display_items, compare_position_at, true);
        break;
    case "viewCountDesc":
        sort(display_items, compare_view_count);
        break;
    case "viewCountAsc":
        sort(display_items, compare_view_count, true);
        break;
    }
    create_list();
}

document.getElementById("sort").addEventListener("change",handle_sort);


const search_form=document.getElementById("searchForm");

const handle_search=(event)=>{
    event.preventDefault();
    const data = new FormData(search_form);

    const minViews=Number(data.get("minViews"))*10000;
    const maxViews=data.get("maxViews")=='' ? 100000000000:Number(data.get("maxViews"))*10000;

    const from_date = data.get("fromDate"); 
    const to_date   = data.get("toDate");
    const filterd_items=display_items.filter(item=>{
        const view_bool=minViews<=item.viewCount && item.viewCount<=maxViews;

        const from_bool = from_date ? new Date(item.snippet.publishedAt) >= new Date(from_date) : true;
        const to_bool = to_date ? new Date(item.snippet.publishedAt) <= new Date(to_date) : true;
        return view_bool && from_bool && to_bool;
    });

    display_items.splice(0,display_items.length,...filterd_items);
    create_list();
}

search_form.addEventListener("submit",handle_search);


const handle_create_playlist=(event) => {
    event.preventDefault(); 
    const target_minutes = Number(document.getElementById("createPlaylistTime").value);
    const times_arr=display_items.map(item=>{
        return item.duration;
    })
    const dp_res=dp(times_arr,target_minutes);
    console.log(dp_res);
    const new_play_list=dp_res.indexes.map(i=>display_items[i]);
    display_items.splice(0,display_items.length,...new_play_list);
    create_list();
    document.getElementById("playlistTotalTime").innerHTML=`${sec_to_our_min(dp_res.best_sum)} のプレイリストを作成しました! `;
}

document.getElementById("createPlaylistForm").addEventListener("submit",handle_create_playlist );


document.getElementById("reset").addEventListener("click",()=>{
    display_items.splice(0,display_items.length,...all_items);
    document.getElementById("playlistTotalTime").innerHTML="";
    create_list();
});


document.getElementById("shuffle").addEventListener("click",()=>{
    const shuffle_arr=shuffleArray(all_items);
    display_items.splice(0,display_items.length,...shuffle_arr);
    create_list();
});


document.getElementById("playlistIdForm").addEventListener("submit",async(event)=>{
    event.preventDefault();
    const playlist_id=document.getElementById("playlistId").value;
    load(playlist_id);
});
export const compare_publishd_at=(playlist_item_a,play_list_item_b)=>{
    const a=playlist_item_a.snippet.publishedAt;
    const b=play_list_item_b.snippet.publishedAt;
    return new Date(a)>new Date(b);
};

export const compare_position_at=(playlist_item_a,play_list_item_b)=>{
    const a=playlist_item_a.snippet.position;
    const b=play_list_item_b.snippet.position;
    return a>b;
};

export const compare_view_count=(play_list_item_a,play_list_item_b)=>{
    const a=play_list_item_a.viewCount;
    const b=play_list_item_b.viewCount;
    return a>b;
}

export const sort=(array,compare_func,reverse=false)=>{
    for (let i=0;i<array.length-1;i++){
        for(let j=0;j<array.length-1-i;j++){
            if(
                reverse ?
                compare_func(array[j],array[j+1])
                :
                !compare_func(array[j],array[j+1])
            ){
                let tmp=array[j+1];
                array[j+1]=array[j];
                array[j]=tmp;
            }
        }
    }
    return array;
};


//最も近い値になる組み合わせを探索
export const dp=(arr,target)=>{
    if(arr.length===0){
        return {
            best_sum: 0,
            indexes:[] 
        };
    }
    target*=60;
    const t_max=target+Math.max(...arr);
    console.log(arr);
    
    let can = Array(t_max + 1).fill(false);// i の合計が作れるかどうか
    let prev = Array(t_max + 1).fill(-1); // 合計iを作った最後に使ったtimesのindex
    can[0] = true;

    //作れる値の全マッピング
    for (let i = 0; i < arr.length; i++) {
        const time=arr[i];
        //target以下の値全てで試す
        //time以外の値でj-timeが作れるなら、jも作れる
        for (let j = t_max; j >= time; j--) {
            if (can[j - time] && !can[j]) { 
                can[j] = true;
                prev[j] = i; 
            }
        }
    }

    let best = 0;
    for (let i = t_max; i >= 0; i--) {
        if (can[i]) {
            if(Math.abs(target-i)<Math.abs(target-best))
            best = i;
        }
    }

    // 組み合わせ復元
    let res = [];
    let now = best;
    while (now > 0) {
        const i = prev[now];
        res.push(i);
        now -= arr[i];
    }
    console.log(can)
    return {
        best_sum: best,
        indexes: res
    };
};

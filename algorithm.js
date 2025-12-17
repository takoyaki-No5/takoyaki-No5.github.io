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

export const dp = (arr, target) => {
    if (arr.length === 0) {
        return {
            best_sum: 0,
            indexes: []
        };
    }

    target *= 60;
    const t_max = target + Math.max(...arr);

    let can = Array(t_max + 1).fill(false);
    let prev = Array.from({ length: t_max + 1 }, () => []); // 複数候補を持つ
    can[0] = true;

    // DPで作れる値をマッピング
    for (let i = 0; i < arr.length; i++) {
        const time = arr[i];
        if(time==0) continue; //動画時間がゼロ(消されたビデオなど)はいれない
        //target以下の値全てで試す
        //time以外の値でj-timeが作れるなら,jも作れる
        for (let j = t_max; j >= time; j--) {
            if (can[j - time]) {
                can[j] = true;
                prev[j].push(i); // 複数候補を追加
            }
        }
    }

    // bestの探索（targetに最も近い値）
    let best = 0;
    for (let i = t_max; i >= 0; i--) {
        if (can[i] && Math.abs(target - i) < Math.abs(target - best)) {
            best = i;
        }
    }
    
    // bestな組み合わせの中から一つをランダムに復元
    let res = [];
    let now = best;
    while (now > 0) {
        const prev_now_arr = prev[now];
        const prev_now = prev_now_arr[Math.floor(Math.random()*prev_now_arr.length)];
        res.push(prev_now);
        now -= arr[prev_now];
    }
    
    return {
        best_sum: best,
        indexes: res
    };
};

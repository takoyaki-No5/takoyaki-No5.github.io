export const request_by_playlist_id=async(playlist_id,api_key)=>{
  const playlist_url =`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlist_id}&key=${api_key}`;
  const playlist_res = await fetch(playlist_url);
  const playlist_data = await playlist_res.json();
  return playlist_data;
}

export const format_view_count=(num)=> {
  if(!num) return '';
  if (num >= 100000000) { 
    const value = (num / 100000000).toFixed(1);
    return value.replace(/\.0$/, '') + '億 回視聴';
  } else if (num >= 10000) {
    return Math.floor(num / 10000) + '万 回視聴';
  } else {
    return num + ' 回視聴';
  }
}

export const parse_duration=(iso)=> {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

export const sec_to_our_min = (sec) => {
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  let text = "";

  if (hours > 0) text += `${hours}時間`;
  if (mins > 0) text += `${mins}分`;
  if (secs > 0) text += `${secs}秒`;

  if (text === "") text = "0秒";

  return text;
};

export const shuffleArray=(array)=> {
  const copy = array.slice(); // 元の配列はコピーして保持
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]; // 要素を入れ替え
  }
  return copy;
}
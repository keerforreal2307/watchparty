import type { Film } from './types';
export const films:Film[] = [
  {
    "id": "sintel",
    "title": "Sintel",
    "year": 2010,
    "minutes": 15,
    "genre": "Fantasy",
    "tags": [
      "Adventure",
      "Animation",
      "Dragons"
    ],
    "description": "A young traveler crosses a breathtaking world in search of a lost friend. A moving, beautifully animated story about the things we hold on to.",
    "image": "/art/sintel.webp",
    "src": "https://video.blender.org/object-storage/web_videos/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/sintel/",
    "color": "#576854"
  },
  {
    "id": "spring",
    "title": "Spring",
    "year": 2019,
    "minutes": 8,
    "genre": "Fantasy",
    "tags": [
      "Animation",
      "Nature",
      "Adventure"
    ],
    "description": "A shepherd girl and her dog awaken ancient spirits to bring spring back to a frozen valley. A wordless story of courage and renewal.",
    "image": "/art/spring.webp",
    "src": "https://video.blender.org/object-storage/web_videos/3d95fb3d-c866-42c8-9db1-fe82f48ccb95-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/spring/",
    "color": "#59754d"
  },
  {
    "id": "big-buck-bunny",
    "title": "Big Buck Bunny",
    "year": 2008,
    "minutes": 10,
    "genre": "Comedy",
    "tags": [
      "Animation",
      "Feel-good",
      "Nature"
    ],
    "description": "One very big rabbit, three mischievous troublemakers, and a forest full of surprises. A bright, playful pick for the whole group.",
    "image": "/art/big-buck-bunny.webp",
    "src": "https://video.blender.org/object-storage/web_videos/bf1f3fb5-b119-4f9f-9930-8e20e892b898-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/big-buck-bunny/",
    "color": "#7c9160"
  },
  {
    "id": "charge",
    "title": "Charge",
    "year": 2022,
    "minutes": 5,
    "genre": "Sci-fi",
    "tags": [
      "Animation",
      "Action",
      "Dystopia"
    ],
    "description": "In a world where machines own the future, an old man fights to keep a small spark alive. A compact, atmospheric science-fiction adventure.",
    "image": "/art/charge.webp",
    "src": "https://video.blender.org/object-storage/web_videos/70528f27-fd51-479f-8146-abb5a7a81fff-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/charge/",
    "color": "#665d50"
  },
  {
    "id": "wing-it",
    "title": "Wing It!",
    "year": 2023,
    "minutes": 4,
    "genre": "Comedy",
    "tags": [
      "Animation",
      "Adventure",
      "Space"
    ],
    "description": "A strait-laced engineer and an impulsive pilot take an experimental aircraft on an unforgettable trip. A fast, funny flight into the unexpected.",
    "image": "/art/wing-it.webp",
    "src": "https://video.blender.org/object-storage/web_videos/1be4c93c-1fd2-498d-adc7-50126823033e-480.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/wing-it/",
    "color": "#878db0"
  },
  {
    "id": "tears-of-steel",
    "title": "Tears of Steel",
    "year": 2012,
    "minutes": 13,
    "genre": "Sci-fi",
    "tags": [
      "Action",
      "Robots",
      "Live action"
    ],
    "description": "A group of scientists and soldiers in Amsterdam tries to recreate a pivotal moment from the past to save the world from destructive robots.",
    "image": "/art/tears-of-steel.webp",
    "src": "https://video.blender.org/object-storage/web_videos/8533ea43-4271-4a57-9694-e9d0b35e1aa1-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/tears-of-steel/",
    "color": "#5d7476"
  },
  {
    "id": "cosmos-laundromat",
    "title": "Cosmos Laundromat",
    "year": 2015,
    "minutes": 13,
    "genre": "Fantasy",
    "tags": [
      "Animation",
      "Surreal",
      "Adventure"
    ],
    "description": "On a windswept island, a mysterious stranger offers a disillusioned sheep a chance to experience another life. Surreal, colorful, and surprising. Contains mature themes.",
    "image": "/art/cosmos-laundromat.webp",
    "src": "https://video.blender.org/object-storage/web_videos/f507dfdc-e73e-45a4-9778-d758cbe1ce96-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/cosmos-laundromat/",
    "color": "#4f6c68"
  },
  {
    "id": "elephants-dream",
    "title": "Elephants Dream",
    "year": 2006,
    "minutes": 11,
    "genre": "Sci-fi",
    "tags": [
      "Animation",
      "Surreal",
      "Mystery"
    ],
    "description": "Two explorers wander through a strange mechanical world, each seeing something different. A dreamlike journey into imagination and connection.",
    "image": "/art/elephants-dream.webp",
    "src": "https://video.blender.org/object-storage/web_videos/cccc3e60-0291-4ecc-aa56-39b2e2c7d0d5-720.mp4",
    "credit": "Blender Foundation / Blender Studio",
    "creditUrl": "https://studio.blender.org/films/elephants-dream/",
    "color": "#70554e"
  }
];
function normalize(text:string) {return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
export function editDistance(a:string,b:string) {const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}return d[a.length][b.length];}
export function filterFilms(catalog:Film[],query:string,genre:string,length:string) {const tokens=normalize(query).slice(0,120).split(' ').filter(Boolean);return catalog.filter(f=>{const words=normalize([f.title,f.genre,...f.tags].join(' ')).split(' ');return (genre==='For you'||f.genre===genre||f.tags.includes(genre))&&(length==='all'||(length==='short'?f.minutes<10:f.minutes>=10))&&tokens.every(t=>words.some(w=>w.includes(t)||(t.length>=3&&editDistance(w,t)<=(t.length>5?2:1))));});}

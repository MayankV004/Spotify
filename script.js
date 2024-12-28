let currentSong = new Audio();

let songs;
let currfolder;
function convertToMinuteSeconds(seconds) {
    if(isNaN(seconds) || seconds < 0)
    {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zero if necessary
    let minutesStr = String(minutes).padStart(2,'0');
    let secondsStr = String(remainingSeconds).padStart(2 , '0');

    return minutesStr + ':' + secondsStr;
}



async function getSongs(folder)
{
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0 ; i < as.length ; i++)
    {
        const element = as[i];
        if(element.href.endsWith(".mp3"))
        {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for(const song of songs)
    {
        songUl.innerHTML = songUl.innerHTML + 
                        `
                        <li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20"," ")}</div>
                                <div>Mayank</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>
                        `
    }
    // Attach a eventListener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        // console.log(e.querySelector(".info").firstElementChild.innerHTML)
        e.addEventListener("click" , element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
     })
     return songs;
    
}

const playMusic = (track , pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    // audio.play()

    currentSong.src =`/${currfolder}/`+track;
    if(!pause)
    {
        currentSong.play();
        Play.src = "img/pause.svg";
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(response)
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess"))
        {
            console.log(e.href.split("/").slice(-1)[0])
            let folder = e.href.split("/").slice(-1)[0]
           
            // get meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML+`
            <div data-folder="${folder}" class="card">
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                        <div class="play-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
            `
        }
    }
      // load the playlist when library
      Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        e.addEventListener("click",async item=>{
            // console.log(item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

    
    
}



async function main(){

    

    // get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0] , true)

     // Display all the albums on the page
    await displayAlbums();
     // Attack a eventListener to play , next and previous
     Play.addEventListener("click", ()=>{
        if(currentSong.paused)
        {
            currentSong.play()
            Play.src = "img/pause.svg"
        }

        else{
            currentSong.pause()
            Play.src = "img/play.svg"
        }
    })
   
    
    // Listen for timeupdata event
    currentSong.addEventListener("timeupdate" , ()=>{
        document.querySelector(".songtime").innerHTML =
        `${convertToMinuteSeconds(currentSong.currentTime)}/${convertToMinuteSeconds(currentSong.duration)}` 

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // add an eventListener
    document.querySelector(".seekbar").addEventListener("click" ,e=>{
         let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100 
         document.querySelector(".circle").style.left = percent
         +"%";
         currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // add an event listener on the hamburger
    document.querySelector(".hamburger").addEventListener("click",function(){
        document.querySelector(".left").style.left = "0%";
    })
    document.querySelector(".closeIcon").addEventListener("click",function(){
        document.querySelector(".left").style.left = "-120%";
    })
    // Add event Listeners to previous and next
    previous.addEventListener("click",function(){
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index - 1) >= 0 )
        {
            playMusic(songs[index-1])
        }
        else
        {
            playMusic(songs[0])
        }
    })

    next.addEventListener("click",function(){
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index + 1) < songs.length - 1)
        {
            playMusic(songs[index+1])
        }
        else
        {
            playMusic(songs[songs.length-1])
        }
    })

    // Add event to change volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = parseInt(e.target.value)/100
    })

   // Add event listener to mute the track
   document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})

  
}

main()

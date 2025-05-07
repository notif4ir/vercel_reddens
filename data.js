const musicData = {
    songs: [
        {
            id: 1,
            title: "Time Paradox OST",
            artist: "Toby Fox",
            album: "",
            cover: "https://i.pinimg.com/736x/79/3d/dd/793ddd4ad5ca955a99f5a8ba728db845.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Undertale_%20Time%20Paradox%20%5BOST%5D.mp3",
            duration: "auto"
        },
        {
            id: 2,
            title: "OH DAM",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i1.sndcdn.com/artworks-M4ZcYSSgFhfz1D1U-sp9nhQ-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/DOORS%20ORIGINAL%20SOUNDTRACK%20VOL.%204%20-%20Oh%20Dam.mp3",
            duration: "auto"
        },
        {
            id: 3,
            title: "C00LKID - FORSAKEN OST",
            artist: "Forsaken",
            album: "FORSAKEN - OST",
            cover: "https://api.voicemod.net/v1/desktop/api.windows/v2/communityVoices/voice/82575ca45e/image.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/READY%20OR%20NOT%20-%20c00lkidd%20Chase%20Theme%20%20Forsaken%20OST.mp3",
            duration: "auto"
        },
        {
            id: 4,
            title: "Steve's Lava Chicken",
            artist: "Minecraft",
            album: "A Minecraft Movie",
            cover: "https://i1.sndcdn.com/artworks-NWK8fSlQueNw-0-t1080x1080.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Steve's%20Lava%20Chicken%20Song%20(Lyrics)%20A%20Minecraft%20Movie%20Soundtrack.mp3",
            duration: "auto"
        },
        {
            id: 5,
            title: "Double Life",
            artist: "Pharrel Williams",
            album: "",
            cover: "https://ecsmedia.pl/c/double-life-b-iext156053548.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Pharrell%20Williams%20-%20Double%20Life%20(Lyrics)%20(from%20Despicable%20Me%204).mp3",
            duration: "auto"
        },
        {
            id: 6,
            title: "Dawn Of Doors",
            artist: "LSplash",
            album: "Doors Ost",
            cover: "https://i1.sndcdn.com/artworks-3fFGOyIuUOZ1dQUy-1OaUyw-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/DOORS%20ORIGINAL%20SOUNDTRACK%20VOL.%201%20-%20Dawn%20Of%20The%20Doors.mp3",
            duration: "auto"
        },
        {
            id: 7,
            title: "Calm Before The Storm",
            artist: "The Foundation RBLX",
            album: "",
            cover: "https://raw.githubusercontent.com/notif4ir/reddins_database/refs/heads/main/Zrzut%20ekranu%202025-04-12%20113252.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Calm%20Before%20the%20Storm.mp3",
            duration: "auto"
        },
        {
            id: 8,
            title: "Chess Type Beat",
            artist: "TheVibeGuide",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b27307ff9101b807094a8d95e472",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Rat%20Dance%20Song%20(Chess%20Type%20Beat).mp3",
            duration: "auto"
        },
        {
            id: 9,
            title: "KSI - Thick Of It",
            artist: "KSI",
            album: "",
            cover: "https://i1.sndcdn.com/artworks-8LPbcMKyqu1ZCd87-2AfrRg-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/KSI%20-%20Thick%20Of%20It%20(feat.%20Trippie%20Redd)%20%5BOfficial%20Lyric%20Video%5D.mp3",
            duration: "auto"
        },
        {
            id: 10,
            title: "Amnesia",
            artist: "Euphoric Brothers",
            album: "",
            cover: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmVkJTIwc3VucmlzZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Amnesia%20-%20Official%20Music%20Video%20(from%20Garten%20of%20Banban)%20%20Lyrics.mp3",
            duration: "auto"
        },
		{
            id: 11,
            title: "A.P.T.",
            artist: "Bruno Mars",
            album: "",
            cover: "https://i1.sndcdn.com/artworks-az7nDtlExUZa7OyJ-zgeE1A-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/ROSE%20&%20Bruno%20Mars%20-%20APT.%20(Official%20Music%20Video).mp3",
            duration: "auto"
        },
		{
            id: 12,
            title: "JOHN DOE - FORSAKEN OST",
            artist: "Forsaken",
            album: "FORSAKEN - OST",
            cover: "https://i1.sndcdn.com/artworks-YiQqOyBBdNHy2lKt-HXnIJg-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Forsaken%20%20John%20Doe%20Terror%20Radius%20Theme.mp3",
            duration: "auto"
        },
		{
            id: 13,
            title: "Jeff's Jingle",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://thumbnails.vrclist.com/358346.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/DOORS%20ORIGINAL%20SOUNDTRACK%20VOL.%202%20-%20Jeff's%20Jingle.mp3",
            duration: "auto"
        },
		{
            id: 14,
            title: "BLUUDUD - FORSAKEN OST",
            artist: "Forsaken",
            album: "FORSAKEN - OST",
            cover: "https://i1.sndcdn.com/artworks-kOqHIJxqsXG3YyYG-ytTXcA-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/bluudude%20chase%20track%20EXTENSION%20FLP%20(Forsaken).mp3",
            duration: "auto"
        },
		{
            id: 15,
            title: "Ready OR Not",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i1.sndcdn.com/artworks-zIVTRuPLOIl9oo8e-RJJ7pg-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/DOORS%20FLOOR%202%20Roblox%20OST_%20Ready%20or%20Not.mp3",
            duration: "auto"
        },
		{
            id: 16,
            title: "Lucid Dreams",
            artist: "Juice WRLD",
            album: "",
            cover: "https://m.media-amazon.com/images/M/MV5BYWIwNjc5Y2UtYmY0Zi00YzQ3LWIzZDctZWRlODI1OGVjNDA3XkEyXkFqcGc@._V1_QL75_UY190_CR74,0,190,190_.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Juice%20Wrld%20-%20Lucid%20Dreams%20(Lyrics).mp3",
            duration: "auto"
        },
		{
            id: 17,
            title: "Rock Bottom",
            artist: "The Foundation RBLX",
            album: "Roblox Doors - OST",
            cover: "https://raw.githubusercontent.com/notif4ir/reddins_database/refs/heads/main/Zrzut%20ekranu%202025-04-12%20120008.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Rock%20Bottom%20(Full%20Version).mp3",
            duration: "auto"
        },		
		{
            id: 18,
            title: "Jeff's Jazzy Jingle",
            artist: "The Foundation RBLX",
            album: "",
            cover: "https://github.com/notif4ir/reddins_database/blob/main/Zrzut%20ekranu%202025-04-12%20120247.png?raw=true",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Jeff's%20Jazzy%20Jingle.mp3",
            duration: "auto"
        },
		{
            id: 19,
            title: "Close TO ME",
            artist: "Forsaken",
            album: "FORSAKEN - OST",
            cover: "https://tiermaker.com/images//media/template_images/2024/17797426/forsaken-roblox-ost-17797426/zzzzz-1743455297close-to-me.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BANNIHILATION%20John%20Doe%20vs.%20FRIEND%20Elliot%5D%20CLOSE%20TO%20ME%20(Red%20Moonrise%20Mix)%20%5BForsaken%20OST%5D.mp3",
            duration: "auto"
        },
		{
            id: 20,
            title: "Smile!",
            artist: "Forsaken",
            album: "FORSAKEN - OST",
            cover: "https://i1.sndcdn.com/artworks-LHWIzBvV8bJI6vo5-9h7c2g-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/SMILE%20(FORSAKEN%20OFFICIAL).mp3",
            duration: "auto"
        },
		{
            id: 21,
            title: "Watch This!",
            artist: "The Foundation RBLX",
            album: "",
            cover: "https://www.dafont.com/forum/attach/orig/1/1/1134278.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Watch%20This.mp3",
            duration: "auto"
        },
	    {
            id: 22,
            title: "Fresh Rain",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i.scdn.co/image/ab67616d0000b273769c1563d3e4b9bd619b5d1b",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/DOORS%20FLOOR%202%20Roblox%20OST_%20Fresh%20Rain.mp3",
            duration: "auto"
        },
		{
            id: 23,
            title: "??? CT - Forsaken OST",
            artist: "Forsaken",
            album: "FORSAKEN - OST",
            cover: "https://i.scdn.co/image/ab67656300005f1f129661b2eecbc5f3992b02b2",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/download.mp3",
            duration: "auto"
        },
		{
            id: 24,
            title: "Haggstrom - C418 Minecraft",
            artist: "Minecraft",
            album: "Minecraft",
            cover: "https://a.allegroimg.com/s512/11688d/0f0ec28d479d899a9c58fa839a2d/MINECRAFT-JAVA-BEDROCK-EDITION-GRA-PC-POLSKA-WERSJA-KLUCZ",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/C418%20-%20Haggstrom%20-%20Minecraft%20Volume%20Alpha.mp3",
            duration: "auto"
        },
		{
            id: 25,
            title: "It's Raining Tacos!",
            artist: "undefined",
            album: "",
            cover: "https://pm1.aminoapps.com/7381/68fac732840e0b334041bc1a91d606416b43cb84r1-633-324v2_128.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/ITS%20RAINING%20TACOS!%20(Roblox%20Music%20Video).mp3",
            duration: "auto"
        },
		{
            id: 26,
            title: "Dive - A One",
            artist: "undefined",
            album: "",
            cover: "https://preview.redd.it/kj-kj-stickman-saga-runs-the-anime-videogame-gauntlet-v0-1gmz028x1npd1.jpg?width=383&format=pjpg&auto=webp&s=7cf19baa7daacca59aa512f33f3d36bbf8c1310e",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Dive!!%20%20A-One%20(The%20Strongest%20Battlegrounds%20KJ's%20Official%20Theme%20Song).mp3",
            duration: "auto"
        },
		{
            id: 27,
            title: "Salinewin.exe [LOUD]",
            artist: "undefined",
            album: "",
            cover: "https://github.com/notif4ir/reddins_database/blob/main/Zrzut%20ekranu%202025-04-12%20182043.png?raw=true",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Salinewin.exe%20V2%20virus%20beat%20(LOUD).mp3",
            duration: "auto"
        },
		{
		    id: 28,
            title: "FNAF Puppet's Music Box",
            artist: "Scott Cawthon",
            album: "",
            cover: "https://i.ytimg.com/vi/S8Dq7a3c45o/hq2.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/FNAF%202_%20The%20Puppet%20music%20box.mp3",
            duration: "auto"
        },
		{
		    id: 29,
            title: "astigmatism",
            artist: "kitz",
            album: "",
            cover: "https://i.ytimg.com/vi/S8Dq7a3c45o/hq2.jpg",
            mp3: "https://i.scdn.co/image/ab67616d0000b273633f2b947f60c360020dd6d1",
            duration: "auto"
        },
		{
		    id: 30,
            title: "peripheral",
            artist: "kitz",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b273cf72ce32d3b164a5d9316fa7",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20peripheral.mp3",
            duration: "auto"
        },
		{
		    id: 31,
            title: "cheap liqour",
            artist: "Ericdoa",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b2735e7cc3fc0de935cb09d681b6",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20cheap%20liquor.mp3",
            duration: "auto"
        },
		{
		    id: 32,
            title: "heather",
            artist: "Ericdoa",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b273e427154ba07871825a9ac721",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20heather.mp3",
            duration: "auto"
        },
		{
		    id: 33,
            title: "hang tight",
            artist: "Cybertrash",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b2737bfc4c0b432ec08b454116f2",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20hang%20tight.mp3",
            duration: "auto"
        },
		{
		    id: 34,
            title: "twisted",
            artist: "MO$h",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b2730f94342d82f1e6850d649ea9",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20twisted.mp3",
            duration: "auto"
        },
		{
		    id: 35,
            title: "dancinwithsomebawdy",
            artist: "Ericdoa",
            album: "",
            cover: "https://i1.sndcdn.com/artworks-VtRtqby5OVym-0-t500x500.jpg",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20dancinwithsomebawdy.mp3",
            duration: "auto"
        },
		{
		    id: 36,
            title: "stepback",
            artist: "Nicopatty",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b27390b39826a0161743a89a7aff",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20stepback.mp3",
            duration: "auto"
        },
		{
		    id: 37,
            title: "kensuke",
            artist: "Nicopatty",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d0000b273a704f447fbba5183aeeb11f0",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20kensuke.mp3",
            duration: "auto"
        },
		{
		    id: 38,
            title: "Grand Piano",
            artist: "Nicopatty",
            album: "",
            cover: "https://i.scdn.co/image/ab67616d00001e02199a52950442425d19d81aa8",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/%5BSPOTDOWNLOADER.COM%5D%20grand%20piano.mp3",
            duration: "auto"
        },
				{
		    id: 39,
            title: "Here I Come",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i.scdn.co/image/ab67616d00001e020922009ba2c16e3ff212fb15",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/SpotiDown.App%20-%20Here%20I%20Come%20-%20LSPLASH.mp3",
            duration: "auto"
        },
		{
		    id: 40,
            title: "Unhinged",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i.scdn.co/image/ab67616d00001e020922009ba2c16e3ff212fb15",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/SpotiDown.App%20-%20Unhinged%20-%20LSPLASH.mp3",
            duration: "auto"
        },
		{
		    id: 41,
            title: "Unhinged II",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i.scdn.co/image/ab67616d00001e025fa2a20c3a4d85aca6159578",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/SpotiDown.App%20-%20Unhinged%20II%20-%20LSPLASH.mp3",
            duration: "auto"
        },
		{
		    id: 42,
            title: "Elevator Jam",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i.scdn.co/image/ab67616d00001e020922009ba2c16e3ff212fb15",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/SpotiDown.App%20-%20Elevator%20Jam%20-%20LSPLASH.mp3",
            duration: "auto"
        },
		{
		    id: 43,
            title: "Guiding Light",
            artist: "LSplash",
            album: "Roblox Doors - OST",
            cover: "https://i.scdn.co/image/ab67616d00001e020922009ba2c16e3ff212fb15",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/SpotiDown.App%20-%20Guiding%20Light%20-%20LSPLASH.mp3",
            duration: "auto"
        },
			{
		    id: 44,
            title: "Creative Control",
            artist: "SMG4",
            album: "undefined",
            cover: "https://github.com/notif4ir/reddins_database/blob/main/Zrzut%20ekranu%202025-05-07%20154415.png?raw=true",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Creative%20Control.mp3",
            duration: "auto"
        },
			{
		    id: 45,
            title: "Puzzle Park",
            artist: "SMG4",
            album: "undefined",
            cover: "https://raw.githubusercontent.com/notif4ir/reddins_database/7d2d946044efb57eb7b5bb1465b9d44bdd859474/Zrzut%20ekranu%202025-05-07%20154431.png",
            mp3: "https://github.com/notif4ir/reddins_database/raw/refs/heads/main/Puzzle%20Park.mp3",
            duration: "auto"
        },
    ],
    
    playlists: [],
    
    albums: [
        {
            id: 1,
            name: "Roblox Doors - OST",
            artist: "LSplash",
            cover: "https://raw.githubusercontent.com/notif4ir/reddins_database/refs/heads/main/Zrzut%20ekranu%202025-04-12%20115556.png",
            songs: [2,6,13,22,39,40,41,42,43]
        },
		{
            id: 2,
            name: "FORSAKEN - OST",
            artist: "Forsaken",
            cover: "https://raw.githubusercontent.com/notif4ir/reddins_database/refs/heads/main/Zrzut%20ekranu%202025-04-12%20113449.png",
            songs: [3,12,19,20,23]
        },
		{
            id: 3,
            name: "A Minecraft Movie",
            artist: "Minecraft",
            cover: "https://mlpnk72yciwc.i.optimole.com/cqhiHLc.IIZS~2ef73/w:auto/h:auto/q:75/https://bleedingcool.com/wp-content/uploads/2025/02/minecraft_the_movie_ver6_xlg.jpg",
            songs: [4]
        },
		{
            id: 4,
            name: "Minecraft",
            artist: "Minecraft",
            cover: "https://a.allegroimg.com/s512/11688d/0f0ec28d479d899a9c58fa839a2d/MINECRAFT-JAVA-BEDROCK-EDITION-GRA-PC-POLSKA-WERSJA-KLUCZ",
            songs: [24]
        },
    ],
    
    artists: [
        {
            id: 1,
            name: "LSplash",
            cover: "https://i.scdn.co/image/ab6761610000e5eb4de95f4daada83eedf6019b8",
            songs: [2,6,13,22,39,40,41,42,43]
        },
        {
            id: 2,
            name: "Forsaken",
            cover: "https://discord.do/wp-content/uploads/2025/02/Forsaken-Roblox-Discord-server.jpg",
            songs: [3,12,19,20,23]
        },
        {
            id: 3,
            name: "Minecraft",
            cover: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Mojang_Studios_Logo_%282020%2C_icon%29.svg",
            songs: [4]
        },
        {
            id: 4,
            name: "Pharrel Williams",
            cover: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-645657836-1.jpg",
            songs: [5]
        },
		{
            id: 5,
            name: "The Foundation RBLX",
            cover: "https://raw.githubusercontent.com/notif4ir/reddins_database/refs/heads/main/Zrzut%20ekranu%202025-04-12%20113252.png",
            songs: [7,18,17,21]
        },
		{
            id: 6,
            name: "TheVibeGuide",
            cover: "https://yt3.ggpht.com/kbaAK-ukMvwCfFTbo77kvDl2OvmRSgZIKUsitdGYWSn3vsEBqi0MyKfgp00scfb4Yn30tTWTfQ=s48-c-k-c0x00ffffff-no-rj",
            songs: [8]
        },
		{
            id: 7,
            name: "KSI",
            cover: "https://i.scdn.co/image/ab6761610000e5ebcb4ae963f0c01900f3e17712",
            songs: [9]
        },
		{
			id: 8,
			name: "Euphoric Brothers",
			cover: "https://yt3.googleusercontent.com/uhMXHGmsbH1iAHgDdYxNhqNbYFhR1XRhceSYW5P8WB7KcwzRaC1LU5iopCSLHb_JQUp51ulKJQ=s900-c-k-c0x00ffffff-no-rj",
			songs: [10]
		},
		{
			id: 9,
			name: "kitz",
			cover: "https://i.scdn.co/image/ab6761610000e5eb282cbecae273b1029752362c",
			songs: [29,30]
		},
		{
			id: 10,
			name: "Juice WRLD",
			cover: "https://i.scdn.co/image/ab6761610000e5eb23a60030944f7853c21565ef",
			songs: [16]
		},
		{
			id: 11,
			name: "Scott Cawthon",
			cover: "https://static.wikia.nocookie.net/five-nights-at-freddys73/images/6/6d/Scottcloseup.png/revision/latest/thumbnail/width/360/height/360?cb=20180310011838",
			songs: [28]
		},
		{
			id: 12,
			name: "Cybertrash",
			cover: "https://i.scdn.co/image/ab6761610000e5eb23e2f284f5144b92293e780a",
			songs: [33]
		},
		{
			id: 13,
			name: "MO$h",
			cover: "https://i.scdn.co/image/ab67616d00001e02ab4cfef76cab5a69e2dfa02b",
			songs: [34]
		},
		{
			id: 14,
			name: "Ericdoa",
			cover: "https://i1.sndcdn.com/artworks-YCBEkpzztBcSdOXE-isO6uA-t500x500.jpg",
			songs: [31,32,35]
		},		
		{
			id: 15,
			name: "Nicopatty",
			cover: "https://i.scdn.co/image/ab6761610000e5eb335cea405704d95fb4c12115",
			songs: [36,37,38]
		},
	    {
			id: 16,
			name: "SMG4",
			cover: "https://i.scdn.co/image/ab6761610000e5eb9c44c00a46132ed4aa2b4564",
			songs: [44]
		},
    ]
};

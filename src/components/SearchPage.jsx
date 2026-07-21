import React, { useState, Suspense, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { Search, MapPin, Volume2, VolumeX, Image as ImageIcon, Camera, Play, Pause, Heart } from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [activeMedia, setActiveMedia] = useState('video'); // 'image', 'video', 'vr'
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const [activeCategory, setActiveCategory] = useState('All');
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [spokenCharIndex, setSpokenCharIndex] = useState(0);
  const [speechLang, setSpeechLang] = useState('en-IN');
  const [translatedData, setTranslatedData] = useState(null);

  const TRENDING_PLACES = [
    // --- MONUMENTS ---
    { name: 'Taj Mahal', location: 'Agra, India', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #e8b979, #b3652f)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/330px-Taj_Mahal_%28Edited%29.jpeg' },
    { name: 'Eiffel Tower', location: 'Paris, France', category: 'Monuments', vrReady: false, gradient: 'linear-gradient(160deg, #7ba3c9, #33587e)', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Eiffel_Tower_logo.svg/330px-Eiffel_Tower_logo.svg.png' },
    { name: 'Colosseum', location: 'Rome, Italy', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #c98b6b, #7a4a34)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/330px-Colosseo_2020.jpg' },
    { name: 'Statue of Liberty', location: 'New York, USA', category: 'Monuments', vrReady: false, gradient: 'linear-gradient(160deg, #8ba89a, #4a6b5d)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg/330px-Front_view_of_Statue_of_Liberty_%28cropped%29.jpg' },
    { name: 'Christ the Redeemer', location: 'Rio de Janeiro, Brazil', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #9ca674, #5a6639)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/330px-Christ_the_Redeemer_-_Cristo_Redentor.jpg' },
    { name: 'Burj Khalifa', location: 'Dubai, UAE', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #8493a8, #2a3b54)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/330px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg' },
    { name: 'Sydney Opera House', location: 'Sydney, Australia', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #c4a77d, #8a6a3b)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/330px-Sydney_Australia._%2821339175489%29.jpg' },
    { name: 'Mount Rushmore', location: 'South Dakota, USA', category: 'Monuments', vrReady: false, gradient: 'linear-gradient(160deg, #d49579, #8c4a30)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mount_Rushmore_detail_view_%28100MP%29.jpg/330px-Mount_Rushmore_detail_view_%28100MP%29.jpg' },
    { name: 'Gateway of India', location: 'Mumbai, India', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #e8ba54, #9c731e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/330px-Mumbai_03-2016_30_Gateway_of_India.jpg' },
    { name: 'Lincoln Memorial', location: 'Washington D.C., USA', category: 'Monuments', vrReady: true, gradient: 'linear-gradient(160deg, #c3d3df, #788a99)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Lincoln_Memorial_east_side.JPG/330px-Lincoln_Memorial_east_side.JPG' },

    // --- TEMPLES ---
    { name: 'Meenakshi Temple', location: 'Madurai, India', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #d9885b, #94401a)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/330px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg' },
    { name: 'Kashi Vishwanath', location: 'Varanasi, India', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #e8ba54, #9c731e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Kashi_Vishwanath.jpg/330px-Kashi_Vishwanath.jpg' },
    { name: 'Borobudur', location: 'Magelang, Indonesia', category: 'Temples', vrReady: false, gradient: 'linear-gradient(160deg, #878581, #4d4b47)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/330px-Pradaksina.jpg' },
    { name: 'Senso-ji', location: 'Tokyo, Japan', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #c74c4c, #852222)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Sensoji_2023.jpg/330px-Sensoji_2023.jpg' },
    { name: 'Angkor Wat', location: 'Siem Reap, Cambodia', category: 'Temples', vrReady: false, gradient: 'linear-gradient(160deg, #c4a77d, #8a6a3b)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Angkor_Wat.jpg/330px-Angkor_Wat.jpg' },
    { name: 'Golden Temple', location: 'Amritsar, India', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #e8b979, #b3652f)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/330px-The_Golden_Temple_of_Amrithsar_7.jpg' },
    { name: 'Prambanan', location: 'Yogyakarta, Indonesia', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #8ba89a, #4a6b5d)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Prambanan_Temple_Yogyakarta_Indonesia.jpg/330px-Prambanan_Temple_Yogyakarta_Indonesia.jpg' },
    { name: 'Tirupati Balaji', location: 'Andhra Pradesh, India', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #c98b6b, #7a4a34)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/330px-Tirumala_090615.jpg' },
    { name: 'Kinkaku-ji', location: 'Kyoto, Japan', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #9ca674, #5a6639)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg/330px-Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg' },
    { name: 'Karnak Temple', location: 'Luxor, Egypt', category: 'Temples', vrReady: true, gradient: 'linear-gradient(160deg, #d37554, #8b3c22)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Temple_de_Louxor_68.jpg/330px-Temple_de_Louxor_68.jpg' },

    // --- NATURE ---
    { name: 'Grand Canyon', location: 'Arizona, USA', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #d37554, #8b3c22)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Canyon_River_Tree_%28165872763%29.jpeg/330px-Canyon_River_Tree_%28165872763%29.jpeg' },
    { name: 'Mount Everest', location: 'Himalayas, Nepal', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #c3d3df, #788a99)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg/330px-Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg' },
    { name: 'Great Barrier Reef', location: 'Queensland, Australia', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #6bc4c9, #2b7a8a)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/ISS-45_StoryOfWater%2C_Great_Barrier_Reef%2C_Australia.jpg/330px-ISS-45_StoryOfWater%2C_Great_Barrier_Reef%2C_Australia.jpg' },
    { name: 'Victoria Falls', location: 'Zambia / Zimbabwe', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #7ba3c9, #33587e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Cataratas_Victoria%2C_Zambia-Zimbabue%2C_2018-07-27%2C_DD_04.jpg/330px-Cataratas_Victoria%2C_Zambia-Zimbabue%2C_2018-07-27%2C_DD_04.jpg' },
    { name: 'Amazon Rainforest', location: 'South America', category: 'Nature', vrReady: false, gradient: 'linear-gradient(160deg, #8ba89a, #4a6b5d)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Amazon17_%285641020319%29.jpg/330px-Amazon17_%285641020319%29.jpg' },
    { name: 'Aurora Borealis', location: 'Iceland', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #8493a8, #2a3b54)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg/330px-Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg' },
    { name: 'Mount Fuji', location: 'Honshu, Japan', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #c74c4c, #852222)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/330px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg' },
    { name: 'Yellowstone', location: 'Wyoming, USA', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #e8ba54, #9c731e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Grand_Canyon_of_yellowstone.jpg/330px-Grand_Canyon_of_yellowstone.jpg' },
    { name: 'Sahara Desert', location: 'North Africa', category: 'Nature', vrReady: false, gradient: 'linear-gradient(160deg, #d49579, #8c4a30)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sahara_real_color.jpg/330px-Sahara_real_color.jpg' },
    { name: 'Galapagos Islands', location: 'Ecuador', category: 'Nature', vrReady: true, gradient: 'linear-gradient(160deg, #6bc4c9, #2b7a8a)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Lobo_marino_%28Zalophus_californianus_wollebaeki%29%2C_Punta_Pitt%2C_isla_de_San_Crist%C3%B3bal%2C_islas_Gal%C3%A1pagos%2C_Ecuador%2C_2015-07-24%2C_DD_11.JPG/330px-Lobo_marino_%28Zalophus_californianus_wollebaeki%29%2C_Punta_Pitt%2C_isla_de_San_Crist%C3%B3bal%2C_islas_Gal%C3%A1pagos%2C_Ecuador%2C_2015-07-24%2C_DD_11.JPG' },

    // --- HERITAGE ---
    { name: 'Machu Picchu', location: 'Cusco, Peru', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #9ca674, #5a6639)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/330px-Machu_Picchu%2C_2023_%28012%29.jpg' },
    { name: 'Petra', location: 'Ma\'an, Jordan', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #d49579, #8c4a30)' },
    { name: 'Pyramids of Giza', location: 'Giza, Egypt', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #e8ba54, #9c731e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Pyramids_of_the_Giza_Necropolis.jpg/330px-Pyramids_of_the_Giza_Necropolis.jpg' },
    { name: 'Stonehenge', location: 'Wiltshire, England', category: 'Heritage', vrReady: false, gradient: 'linear-gradient(160deg, #878581, #4d4b47)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/330px-Stonehenge2007_07_30.jpg' },
    { name: 'Great Wall of China', location: 'Huairou, China', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #c98b6b, #7a4a34)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/330px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg' },
    { name: 'Acropolis of Athens', location: 'Athens, Greece', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #c3d3df, #788a99)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg/330px-1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg' },
    { name: 'Chichen Itza', location: 'Yucatan, Mexico', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #d9885b, #94401a)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/330px-Chichen_Itza_3.jpg' },
    { name: 'Alhambra', location: 'Granada, Spain', category: 'Heritage', vrReady: false, gradient: 'linear-gradient(160deg, #c4a77d, #8a6a3b)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/330px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg' },
    { name: 'Taj Mahal', location: 'Agra, India', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #e8b979, #b3652f)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/330px-Taj_Mahal_%28Edited%29.jpeg' },
    { name: 'Pompeii', location: 'Campania, Italy', category: 'Heritage', vrReady: true, gradient: 'linear-gradient(160deg, #7ba3c9, #33587e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Aerial_image_of_Pompeii_and_Mount_Vesuvius_%28view_from_the_southeast%29.jpg/330px-Aerial_image_of_Pompeii_and_Mount_Vesuvius_%28view_from_the_southeast%29.jpg' },

    // --- SPACE ---
    { name: 'ISS (Space Station)', location: 'Low Earth Orbit', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #8493a8, #2a3b54)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/International_Space_Station_after_undocking_of_STS-132.jpg/330px-International_Space_Station_after_undocking_of_STS-132.jpg' },
    { name: 'Mars Surface', location: 'Gale Crater, Mars', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #c2694f, #752914)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mars_Curiosity_Rover_-_Gale_Crater.jpg/330px-Mars_Curiosity_Rover_-_Gale_Crater.jpg' },
    { name: 'Moon Landing Site', location: 'Sea of Tranquility', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #c3d3df, #788a99)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Apollo_11_AS11-40-5874.jpg/330px-Apollo_11_AS11-40-5874.jpg' },
    { name: 'Jupiter Great Red Spot', location: 'Jupiter Atmosphere', category: 'Space', vrReady: false, gradient: 'linear-gradient(160deg, #d37554, #8b3c22)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/330px-Jupiter.jpg' },
    { name: 'Saturn Rings', location: 'Saturn Orbit', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #e8ba54, #9c731e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/PIA17172_Saturn_eclipse_mosaic_bright_crop.jpg/330px-PIA17172_Saturn_eclipse_mosaic_bright_crop.jpg' },
    { name: 'Pluto Surface', location: 'Kuiper Belt', category: 'Space', vrReady: false, gradient: 'linear-gradient(160deg, #7ba3c9, #33587e)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/330px-Pluto_in_True_Color_-_High-Res.jpg' },
    { name: 'Andromeda Galaxy', location: 'Local Group', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #9ca674, #5a6639)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Andromeda_Galaxy_2025.png/330px-Andromeda_Galaxy_2025.png' },
    { name: 'Orion Nebula', location: 'Milky Way', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #c74c4c, #852222)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/330px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg' },
    { name: 'Pillars of Creation', location: 'Eagle Nebula', category: 'Space', vrReady: true, gradient: 'linear-gradient(160deg, #d49579, #8c4a30)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Eagle_nebula_pillars.jpg/330px-Eagle_nebula_pillars.jpg' },
    { name: 'Voyager 1 Probe', location: 'Interstellar Space', category: 'Space', vrReady: false, gradient: 'linear-gradient(160deg, #878581, #4d4b47)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Voyager.jpg/330px-Voyager.jpg' }
  ];

  const filteredPlaces = activeCategory === 'Saved' 
    ? TRENDING_PLACES.filter(p => savedPlaces.includes(p.name))
    : activeCategory === 'All' ? TRENDING_PLACES : TRENDING_PLACES.filter(p => p.category === activeCategory);

  const isSpeakingRef = useRef(false);
  const textContainerRef = useRef(null);
  const videoIframeRef = useRef(null);
  const audioRef = useRef(null);
  const cloudAudioRef = useRef(null);

  useEffect(() => {
    if (activeMedia === 'vr') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setSpokenCharIndex(0);
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    } else if (activeMedia === 'image' || activeMedia === 'video') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (locationData && !isSpeakingRef.current) {
        speakSummary(translatedData ? translatedData.summary : locationData.summary);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (cloudAudioRef.current) {
        cloudAudioRef.current.pause();
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setSpokenCharIndex(0);
    }
  }, [activeMedia, locationData, translatedData]);

  const toggleVideoPlay = (e) => {
    e.stopPropagation();
    if (videoIframeRef.current && videoIframeRef.current.contentWindow) {
      const action = isVideoPlaying ? 'pauseVideo' : 'playVideo';
      videoIframeRef.current.contentWindow.postMessage(`{"event":"command","func":"${action}","args":""}`, '*');
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!locationData) return;
    
    if (speechLang.startsWith('en')) {
      setTranslatedData(null);
      if (isSpeakingRef.current) {
        speakSummary(locationData.summary);
      }
      return;
    }

    const targetLangCode = speechLang.split('-')[0];
    
    const translate = async () => {
      try {
        const [resName, resSummary] = await Promise.all([
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(locationData.name)}`),
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(locationData.summary)}`)
        ]);
        const dataName = await resName.json();
        const dataSummary = await resSummary.json();
        
        const translatedName = dataName[0].map(x => x[0]).join('').trim();
        const translatedSummary = dataSummary[0].map(x => x[0]).join('').trim();
        
        const newTranslatedData = {
          name: translatedName || locationData.name,
          summary: translatedSummary || locationData.summary
        };
        
        setTranslatedData(newTranslatedData);
        if (isSpeakingRef.current) {
          speakSummary(newTranslatedData.summary);
        }
      } catch (err) {
        console.error("Translation failed:", err);
        setTranslatedData(null);
        if (isSpeakingRef.current) {
          speakSummary(locationData.summary);
        }
      }
    };
    
    translate();
  }, [speechLang, locationData]);

  const speakSummary = (text) => {
    if (!text) return;
    
    // Stop any current audio
    window.speechSynthesis.cancel();
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
    }
    setSpokenCharIndex(0);
    
    setTimeout(() => {
      if (!speechLang.startsWith('en')) {
        // Use Google Cloud TTS via audio tag for regional Indian languages
        const langCode = speechLang.split('-')[0];
        const sentences = text.match(/[^.!?।\n]+[.!?।\n]+/g) || [text];
        let chunks = [];
        let curr = "";
        sentences.forEach(s => {
          if (curr.length + s.length > 150) {
             if (curr) chunks.push(curr);
             curr = s;
          } else {
             curr += s;
          }
        });
        if (curr) chunks.push(curr);
        
        let currentChunkIdx = 0;
        let cumulativeChars = 0;
        
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        
        const playNextChunk = () => {
          if (!isSpeakingRef.current || currentChunkIdx >= chunks.length) {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            setSpokenCharIndex(text.length); 
            return;
          }
          
          const chunkText = chunks[currentChunkIdx];
          const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(chunkText)}`;
          
          if (!cloudAudioRef.current) return;
          const audio = cloudAudioRef.current;
          audio.src = url;
          audio.playbackRate = 0.95;
          
          let animationFrame;
          const startSync = () => {
            const sync = () => {
              if (audio.duration && !audio.paused) {
                 const ratio = audio.currentTime / audio.duration;
                 const chars = cumulativeChars + Math.floor(ratio * chunkText.length);
                 setSpokenCharIndex(chars);
                 if (textContainerRef.current) {
                   const scrollRatio = chars / text.length;
                   textContainerRef.current.scrollTop = (textContainerRef.current.scrollHeight - textContainerRef.current.clientHeight) * scrollRatio;
                 }
              }
              if (isSpeakingRef.current && currentChunkIdx < chunks.length) {
                 animationFrame = requestAnimationFrame(sync);
              }
            };
            sync();
          };
          
          audio.onplay = () => {
            startSync();
          };
          
          audio.onended = () => {
             cancelAnimationFrame(animationFrame);
             cumulativeChars += chunkText.length;
             currentChunkIdx++;
             playNextChunk();
          };
          
          audio.onerror = () => {
             cancelAnimationFrame(animationFrame);
             cumulativeChars += chunkText.length;
             currentChunkIdx++;
             playNextChunk();
          };
          
          audio.play().catch(e => {
            console.error("Audio playback blocked", e);
            cancelAnimationFrame(animationFrame);
            cumulativeChars += chunkText.length;
            currentChunkIdx++;
            playNextChunk();
          });
        };
        
        playNextChunk();
        
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang;
        
        const availableVoices = window.speechSynthesis.getVoices();
        const selectedVoice = availableVoices.find(v => v.lang === speechLang) 
                          || availableVoices.find(v => v.lang.includes(speechLang.split('-')[0]));
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = 0.95;
        utterance.pitch = 1;
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        };
  
        utterance.onend = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setSpokenCharIndex(0);
        };
  
        utterance.onerror = (e) => {
          console.error("Speech error:", e);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setSpokenCharIndex(0);
        };
  
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            setSpokenCharIndex(e.charIndex);
            if (textContainerRef.current) {
              const ratio = e.charIndex / text.length;
              textContainerRef.current.scrollTop = (textContainerRef.current.scrollHeight - textContainerRef.current.clientHeight) * ratio;
            }
          }
        };
  
        window.speechSynthesis.speak(utterance);
      }
    }, 50);
  };
  
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (cloudAudioRef.current) {
        cloudAudioRef.current.pause();
      }
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setSpokenCharIndex(0);
    } else if (locationData) {
      speakSummary(locationData.summary);
    }
  };

  const handleSearch = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const queryToUse = directQuery || searchQuery;
    if (!queryToUse.trim()) return;

    setIsSearching(true);
    let normalizedSearch = queryToUse.trim().toLowerCase();
    
    try {
      let title = normalizedSearch;
      let summary = `${normalizedSearch} is a beautiful destination.`;
      let imageUrl = null;

      try {
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(normalizedSearch)}&utf8=&format=json&origin=*`);
        const searchData = await searchRes.json();
        
        if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
          const correctTitle = searchData.query.search[0].title;
          const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exsentences=5&explaintext=true&piprop=original&titles=${encodeURIComponent(correctTitle)}&format=json&origin=*`);
          
          if (response.ok) {
            const dataWrapper = await response.json();
            const pages = dataWrapper.query.pages;
            const data = Object.values(pages)[0];
            if (data && !data.missing) {
              title = data.title;
              summary = data.extract ? data.extract.replace(/==.*?==/g, '').trim() : summary;
              imageUrl = data.original?.source || null;
            }
          }
        }
      } catch (wikiErr) {
        console.error("Wikipedia API fetch failed:", wikiErr);
      }

      let youtubeId = null;
      try {
        const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(normalizedSearch + " cinematic drone 4k landscape high quality")}&type=video&videoDefinition=high&maxResults=1&key=AIzaSyAql1uryXvB8TTeBg63O-2JoXes20KE-T8`);
        if (ytResponse.ok) {
          const ytData = await ytResponse.json();
          if (ytData.items && ytData.items.length > 0) {
            youtubeId = ytData.items[0].id.videoId;
          }
        }
      } catch (ytError) {
        console.error("YouTube API fetch failed:", ytError);
      }

      // Dynamically fetch VR 360 video from YouTube API!
      let vrYoutubeId = null;
      try {
        const vrResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(normalizedSearch + " 360 VR immersive panorama")}&type=video&videoDefinition=high&maxResults=1&key=AIzaSyAql1uryXvB8TTeBg63O-2JoXes20KE-T8`);
        if (vrResponse.ok) {
          const vrData = await vrResponse.json();
          if (vrData.items && vrData.items.length > 0) {
            vrYoutubeId = vrData.items[0].id.videoId;
          }
        }
      } catch (vrError) {
        console.error("YouTube VR API fetch failed:", vrError);
      }

      const newData = {
        name: title,
        summary: summary,
        imageUrl: imageUrl,
        videoUrl: null,
        youtubeId: youtubeId,
        vrYoutubeId: vrYoutubeId
      };
      setLocationData(newData);
      setVideoFailed(false);
      setActiveMedia(null);
      
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', width: '100vw', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif",
      '--bg': '#18181b',
      '--surface': '#ffffff',
      '--surface-2': '#fdf8fa',
      '--line': 'rgba(0,0,0,0.1)',
      '--line-strong': 'rgba(0,0,0,0.2)',
      '--violet': '#d63384',
      '--violet-dim': 'rgba(214, 51, 132, 0.1)',
      '--cyan': '#20c997',
      '--cyan-dim': 'rgba(32, 201, 151, 0.14)',
      '--text': '#222222',
      '--text-dim': '#555555',
      '--text-faint': '#888888'
    }}>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/ambiences/meditation_bell_and_river.ogg" loop />
      
      {/* Background from Mockup */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
        background: 'var(--bg)'
      }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <Suspense fallback={null}>
            <Environment preset="city" />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Minimal Back Button Overlay */}
      {locationData && (
        <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 150 }}>
          <div 
            onClick={() => { setLocationData(null); setSearchQuery(''); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer', 
              background: 'rgba(0,0,0,0.6)', 
              padding: '12px 24px', 
              borderRadius: '40px', 
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
              ':hover': { transform: 'scale(1.05)' }
            }}
          >
            <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>← Dashboard</span>
          </div>
        </div>
      )}

      {/* Main Interface Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
        
        {/* Dynamic Empty State vs Results State */}
        {!locationData ? (
          <div style={{ flex: 1, display: 'flex', width: '100%', maxWidth: '100%', margin: 0, padding: 0, overflow: 'hidden' }}>
             
             {/* Categories Sidebar (Left Side) */}
             <div style={{ width: '220px', flexShrink: 0, padding: '40px 15px 0 25px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                
                {/* Dashboard Logo */}
                <div 
                  onClick={() => { setLocationData(null); setSearchQuery(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '40px', paddingLeft: '8px' }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--violet), var(--cyan))' }}></div>
                  <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', margin: 0, fontWeight: 700, color: 'white' }}>
                    VR Explorer
                  </h1>
                </div>

                <div onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '24px', marginBottom: '16px', paddingLeft: '16px' }}>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Categories</h3>
                  <div style={{ marginLeft: 'auto', marginRight: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                    {isCategoriesExpanded ? '▲' : '▼'}
                  </div>
                </div>
                
                {isCategoriesExpanded && (
                  <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                    <div onClick={() => setActiveCategory('All')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'All' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'All' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'All' ? 600 : 500 }}>All Destinations</div>
                    <div onClick={() => setActiveCategory('Saved')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'Saved' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'Saved' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'Saved' ? 600 : 500, display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>Saved Places <Heart size={14} fill={activeCategory === 'Saved' ? 'var(--violet)' : 'transparent'} color={activeCategory === 'Saved' ? 'var(--violet)' : 'rgba(255,255,255,0.4)'} style={{ marginLeft: 'auto' }} /></div>
                    
                    <div onClick={() => setActiveCategory('Monuments')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'Monuments' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'Monuments' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'Monuments' ? 600 : 500 }}>Monuments</div>
                    
                    <div onClick={() => setActiveCategory('Temples')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'Temples' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'Temples' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'Temples' ? 600 : 500 }}>Temples</div>
                    
                    <div onClick={() => setActiveCategory('Nature')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'Nature' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'Nature' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'Nature' ? 600 : 500 }}>Nature</div>
                    
                    <div onClick={() => setActiveCategory('Heritage')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'Heritage' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'Heritage' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'Heritage' ? 600 : 500 }}>Heritage</div>
                    
                    <div onClick={() => setActiveCategory('Space')} style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', background: activeCategory === 'Space' ? 'rgba(214,51,132,0.15)' : 'transparent', color: activeCategory === 'Space' ? 'var(--violet)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeCategory === 'Space' ? 600 : 500 }}>Space</div>
                  </div>
                )}
             </div>

             {/* Main Content Area (Right Side) */}
             <div style={{ flex: 1, background: '#fffcf5', margin: 0, padding: '20px 60px', paddingBottom: '100px', overflowY: 'auto' }}>
                
                {/* Search Bar in Content Area */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                  <form onSubmit={handleSearch} style={{
                    width: '600px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 20px',
                    borderRadius: '40px',
                    background: 'white',
                    border: '1px solid var(--line)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease'
                  }}>
                    <Search size={20} color="var(--violet)" style={{ marginRight: '10px' }} />
                    <input 
                      type="text" 
                      placeholder="Explore the world (e.g. Taj Mahal)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    <button type="submit" disabled={isSearching} style={{
                      background: 'var(--violet)',
                      border: 'none',
                      borderRadius: '30px',
                      padding: '8px 24px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: isSearching ? 'not-allowed' : 'pointer'
                    }}>
                      {isSearching ? '...' : 'Explore'}
                    </button>
                  </form>
                </div>
                
               {/* Main Hero Header */}
               <div style={{ marginBottom: '30px' }}>
                 <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '15px', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text)' }}>Step Into The World</h2>
                 <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', maxWidth: '700px', lineHeight: '1.6' }}>Search for any location on earth to instantly experience cinematic drone footage, immersive 360° VR content, and AI-narrated stories.</p>
               </div>

               {/* Trending Grid Section */}
               <div style={{ width: '100%' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                   <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
                     {activeCategory === 'All' ? 'Trending now' : `${activeCategory} Destinations`}
                   </h3>
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                 
                 {filteredPlaces.map((place, index) => (
                   <div key={index} onClick={() => { setSearchQuery(place.name); handleSearch(null, place.name); }} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '20px', display: 'flex', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' } }}>
                     <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: place.gradient, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                        {place.image && <img src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                         <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{place.name}</h4>
                       </div>
                       <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '0' }}>{place.location}</p>
                     </div>
                   </div>
                 ))}

                 </div>
               </div>
             </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            background: '#fffcf5',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 100
          }}>
            
            {/* Media Section */}
            {activeMedia !== null && (
              <div style={{
                flex: '0 0 55%',
                background: '#000',
                position: 'relative',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '20px 0 50px rgba(0,0,0,0.5)',
                zIndex: 5
              }}>
                {activeMedia === 'vr' ? (
                  locationData.vrYoutubeId ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${locationData.vrYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${locationData.vrYoutubeId}&controls=1&modestbranding=1&rel=0&fs=1`} 
                      title="YouTube VR video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking" 
                      allowFullScreen
                      style={{ objectFit: 'cover' }}
                    ></iframe>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      {locationData.imageUrl && (
                        <img src={locationData.imageUrl} alt="Fallback" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, filter: 'blur(5px)' }} />
                      )}
                      <div style={{ position: 'relative', zIndex: 10 }}>
                        <Camera size={64} color="var(--cyan)" style={{ marginBottom: '20px' }} />
                        <h3 style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '1.8rem', fontFamily: "'Space Grotesk', sans-serif" }}>VR Video Not Available</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '300px' }}>We couldn't find a high-quality 360° VR video for this specific location.</p>
                      </div>
                    </div>
                  )
                ) : activeMedia === 'video' && locationData.youtubeId ? (
                  <>
                    <iframe 
                      ref={videoIframeRef}
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${locationData.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${locationData.youtubeId}&controls=0&modestbranding=1&rel=0&enablejsapi=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      style={{ objectFit: 'cover', transform: 'scale(1.4)', pointerEvents: 'none' }}
                    ></iframe>
                    {/* Custom Play/Pause Overlay */}
                    <div 
                      onClick={toggleVideoPlay}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        background: isVideoPlaying ? 'transparent' : 'rgba(0,0,0,0.3)',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      <div style={{
                        background: 'rgba(20, 20, 43, 0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '50%',
                        opacity: isVideoPlaying ? 0 : 1,
                        transform: isVideoPlaying ? 'scale(0.8)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        {isVideoPlaying ? <Play size={40} color="white" /> : <Pause size={40} color="white" />}
                      </div>
                    </div>
                  </>
                ) : locationData.videoUrl && !videoFailed ? (
                  <video 
                    src={locationData.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    onError={() => setVideoFailed(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : activeMedia === 'image' && locationData.imageUrl ? (
                  <img 
                    src={locationData.imageUrl} 
                    alt={locationData.name} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.3)' }}>
                    <ImageIcon size={48} />
                    <p>No Visuals Available</p>
                  </div>
                )}
                {/* Gradient Overlay for blending */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', background: 'linear-gradient(to right, transparent, #fffcf5)', pointerEvents: 'none' }} />
              </div>
            )}

            {/* Content Section */}
            <div style={{ padding: '40px 50px', flex: '1', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
                {/* Back button removed as requested */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ 
                      margin: 0, 
                      fontSize: '2.5rem', 
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: '700',
                      color: 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <MapPin color="var(--violet)" size={32} />
                      {translatedData ? translatedData.name : locationData.name}
                    </h2>
                    <div style={{ height: '4px', width: '60px', background: 'linear-gradient(135deg, var(--violet), var(--cyan))', borderRadius: '2px', marginTop: '10px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <select 
                      value={speechLang}
                      onChange={(e) => {
                        if (cloudAudioRef.current) cloudAudioRef.current.play().catch(()=>{});
                        setSpeechLang(e.target.value);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        padding: '8px 12px',
                        color: 'var(--text)',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="en-IN" style={{ color: 'black' }}>English (India)</option>
                      <option value="hi-IN" style={{ color: 'black' }}>Hindi (India)</option>
                      <option value="ta-IN" style={{ color: 'black' }}>Tamil (India)</option>
                      <option value="te-IN" style={{ color: 'black' }}>Telugu (India)</option>
                      <option value="kn-IN" style={{ color: 'black' }}>Kannada (India)</option>
                      <option value="ml-IN" style={{ color: 'black' }}>Malayalam (India)</option>
                    </select>

                    <button 
                      onClick={() => {
                        if (savedPlaces.includes(locationData.name)) {
                          setSavedPlaces(savedPlaces.filter(n => n !== locationData.name));
                        } else {
                          setSavedPlaces([...savedPlaces, locationData.name]);
                        }
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Heart size={24} color={savedPlaces.includes(locationData.name) ? 'var(--violet)' : 'var(--text)'} fill={savedPlaces.includes(locationData.name) ? 'var(--violet)' : 'none'} />
                    </button>

                    <button 
                      onClick={toggleSpeech}
                      style={{
                        background: isSpeakingRef.current ? 'var(--violet)' : 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isSpeakingRef.current ? '0 0 20px rgba(139, 124, 246, 0.6)' : 'none'
                      }}
                    >
                      {isSpeakingRef.current ? <Volume2 size={24} color="white" /> : <VolumeX size={24} color="white" />}
                    </button>
                  </div>
                </div>

                {/* CTA Row from Mockup */}
                {activeMedia === null && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
                    <div 
                      onClick={() => {
                        if (cloudAudioRef.current) cloudAudioRef.current.play().catch(()=>{});
                        setActiveMedia('image');
                      }}
                      style={{ flex: 1, padding: '13px', borderRadius: '14px', textAlign: 'center', fontSize: '13px', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', transition: 'all 0.2s' }}
                    >
                      🖼️<span>View Image</span><small style={{ fontSize: '10px', opacity: 0.75, fontWeight: 400 }}>High Quality</small>
                    </div>
                    <div 
                      onClick={() => {
                        if (cloudAudioRef.current) cloudAudioRef.current.play().catch(()=>{});
                        setActiveMedia('video');
                      }}
                      style={{ flex: 1, padding: '13px', borderRadius: '14px', textAlign: 'center', fontSize: '13px', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', transition: 'all 0.2s' }}
                    >
                      ▶<span>Watch video</span><small style={{ fontSize: '10px', opacity: 0.75, fontWeight: 400 }}>Cinematic</small>
                    </div>
                    <div 
                      onClick={() => {
                        if (cloudAudioRef.current) cloudAudioRef.current.play().catch(()=>{});
                        setActiveMedia('vr');
                      }}
                      style={{ flex: 1, padding: '13px', borderRadius: '14px', textAlign: 'center', fontSize: '13px', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'linear-gradient(135deg, var(--cyan), #2fb8b0)', color: '#fff', position: 'relative', overflow: 'hidden' }}
                    >
                      <div style={{ position: 'absolute', width: '70px', height: '70px', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50%', top: '-20px', right: '-20px' }}></div>
                      <span>Enter VR</span><small style={{ fontSize: '10px', opacity: 0.75, fontWeight: 400 }}>360° immersive</small>
                    </div>
                  </div>
                )}

                {/* Content / Text Matter */}
                {activeMedia !== null && (
                  <>
                    <button 
                      onClick={() => setActiveMedia(null)}
                      style={{
                        background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', 
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '500'
                      }}
                    >
                      ← Change Media
                    </button>
                    <div ref={textContainerRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '20px', scrollBehavior: 'smooth' }}>
                      <p style={{ 
                        fontSize: '1.25rem', 
                        lineHeight: '1.8', 
                        color: 'var(--text-dim)',
                        margin: 0
                      }}>
                        {activeMedia === 'vr' ? (
                          (translatedData ? translatedData.summary : locationData.summary)
                        ) : (
                          <>
                            <span style={{ color: 'var(--text)', transition: 'color 0.2s' }}>
                              {(translatedData ? translatedData.summary : locationData.summary).substring(0, spokenCharIndex)}
                            </span>
                            <span style={{ opacity: 0 }}>
                              {(translatedData ? translatedData.summary : locationData.summary).substring(spokenCharIndex)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
          </div>
        )}

        <audio ref={audioRef} src="https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" loop style={{ display: 'none' }} />
        <audio ref={cloudAudioRef} referrerPolicy="no-referrer" style={{ display: 'none' }} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --bg: #0a0a18;
          --surface: #14142b;
          --surface-2: #1c1c3a;
          --line: rgba(255,255,255,0.08);
          --line-strong: rgba(255,255,255,0.16);
          --violet: #8b7cf6;
          --violet-dim: rgba(139,124,246,0.16);
          --cyan: #4fd8d0;
          --cyan-dim: rgba(79,216,208,0.14);
          --text: #f2f1ff;
          --text-dim: #9694b8;
          --text-faint: #605d80;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Custom scrollbar for text container */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
      `}} />
    </div>
  );
}

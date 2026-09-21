// Small interactions: reveal-on-scroll and dynamic year.
const siteNav=document.querySelector('.nav');
const menuToggle=document.querySelector('.nav-menu-toggle');
if(siteNav&&menuToggle){
  const closeMenu=()=>{
    siteNav.classList.remove('is-mobile-open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Open navigation');
    document.body.classList.remove('menu-open');
  };
  menuToggle.addEventListener('click',()=>{
    const opening=!siteNav.classList.contains('is-mobile-open');
    siteNav.classList.toggle('is-mobile-open',opening);
    menuToggle.setAttribute('aria-expanded',String(opening));
    menuToggle.setAttribute('aria-label',opening?'Close navigation':'Open navigation');
    document.body.classList.toggle('menu-open',opening);
  });
  siteNav.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{if(window.innerWidth>800)closeMenu();});
}

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const target=document.querySelector(a.getAttribute('href'));
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}
  });
});
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  });
},{threshold:.12});
document.querySelectorAll('.project,.cap,.about-copy,.statement h2,.section-head').forEach(el=>{
  el.classList.add('reveal'); observer.observe(el);
});

document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  carousel.querySelectorAll('[data-direction]').forEach(button=>{
    button.addEventListener('click',()=>{
      const track=button.closest('.carousel-group')?.querySelector('.video-carousel')||button.closest('.gallery-panel')?.querySelector('.video-carousel')||carousel.querySelector('.video-carousel');
      if(!track)return;
      const direction=button.dataset.direction==='next'?1:-1;
      track.scrollBy({left:track.clientWidth*.8*direction,behavior:'smooth'});
    });
  });
});

// Open playable work in an immersive viewer with familiar video controls.
const openVideoLightbox=({title,type,src,videoId,start=0,poster=''})=>{
  const lightbox=document.createElement('div');
  lightbox.className='video-lightbox';
  lightbox.setAttribute('role','dialog');
  lightbox.setAttribute('aria-modal','true');
  lightbox.setAttribute('aria-label',title||'Video player');
  const stage=document.createElement('div');
  stage.className='video-lightbox-stage';
  const close=document.createElement('button');
  close.className='video-lightbox-close';
  close.type='button';
  close.setAttribute('aria-label','Close video');
  close.textContent='×';
  if(type==='youtube'){
    const iframe=document.createElement('iframe');
    iframe.title=title||'YouTube video';
    iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen=true;
    iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&controls=1&rel=0&playsinline=1&start=${start}`;
    stage.appendChild(iframe);
  }else{
    const video=document.createElement('video');
    video.src=src;
    video.poster=poster;
    video.controls=true;
    video.autoplay=true;
    video.playsInline=true;
    video.setAttribute('playsinline','');
    video.setAttribute('referrerpolicy','no-referrer');
    stage.appendChild(video);
  }
  const closeLightbox=()=>{
    document.removeEventListener('keydown',handleKey);
    lightbox.remove();
    document.body.classList.remove('video-modal-open');
  };
  const handleKey=event=>{if(event.key==='Escape')closeLightbox();};
  close.addEventListener('click',closeLightbox);
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',handleKey);
  lightbox.append(stage,close);
  document.body.appendChild(lightbox);
  document.body.classList.add('video-modal-open');
  close.focus();
};

document.querySelectorAll('.video-card[href*="youtube.com/watch"]').forEach(card=>{
  card.addEventListener('click',event=>{
    event.preventDefault();
    const url=new URL(card.href);
    const videoId=url.searchParams.get('v');
    if(!videoId)return;
    openVideoLightbox({
      title:card.querySelector('span')?.textContent.trim()||'YouTube video',
      type:'youtube',
      videoId,
      start:parseInt(url.searchParams.get('t'),10)||0
    });
  });
});

// Replace full X post cards with direct, dependable video players and a branded play control.
const socialFallbackPosters={
  '2100592660301926511':'https://pbs.twimg.com/amplify_video_thumb/2100591856966864897/img/Wc3T9hBx9huj0w6e?format=webp&name=medium',
  '2100177878356742593':'https://pbs.twimg.com/amplify_video_thumb/2100156489176412160/img/4MbFTaFiAz7EUreF?format=webp&name=medium'
};
document.querySelectorAll('.social-post-card .twitter-tweet').forEach(tweet=>{
  const link=tweet.querySelector('a[href*="/status/"]');
  const match=link?.href.match(/\/status\/(\d+)/);
  const source=match&&window.SOCIAL_VIDEO_SOURCES?.[match[1]];
  if(!match)return;
  const player=document.createElement('div');
  player.className='social-video-player';
  const makeXFallback=()=>{
    if(player.classList.contains('is-x-link'))return;
    player.replaceChildren();
    player.classList.add('is-x-link');
    const title=tweet.closest('.social-post-card')?.querySelector('.social-post-label')?.textContent.trim()||'Sutton United social media video';
    const poster=source?.poster||socialFallbackPosters[match[1]];
    if(poster)player.style.backgroundImage=`url("${poster}")`;
    const fallbackPlay=document.createElement('a');
    fallbackPlay.className='social-video-play';
    fallbackPlay.href=link.href;
    fallbackPlay.target='_blank';
    fallbackPlay.rel='noopener noreferrer';
    fallbackPlay.setAttribute('aria-label',`Play ${title} on X`);
    fallbackPlay.innerHTML='<span aria-hidden="true">▶</span>';
    player.append(fallbackPlay);
  };
  if(!source){
    tweet.replaceWith(player);
    makeXFallback();
    return;
  }
  const video=document.createElement('video');
  video.className='social-video-embed';
  video.src=source.src;
  video.poster=source.poster;
  video.referrerPolicy='no-referrer';
  video.setAttribute('referrerpolicy','no-referrer');
  video.preload='metadata';
  video.controls=false;
  video.playsInline=true;
  video.setAttribute('playsinline','');
  video.setAttribute('aria-label',tweet.closest('.social-post-card')?.querySelector('.social-post-label')?.textContent.trim()||'Sutton United social media video');
  const play=document.createElement('button');
  play.className='social-video-play';
  play.type='button';
  play.setAttribute('aria-label',`Play ${video.getAttribute('aria-label')}`);
  play.innerHTML='<span aria-hidden="true">▶</span>';
  const openPlayer=()=>openVideoLightbox({
    title:video.getAttribute('aria-label'),
    type:'video',
    src:source.src,
    poster:source.poster
  });
  play.addEventListener('click',openPlayer);
  video.addEventListener('click',openPlayer);
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    player.addEventListener('mouseenter',()=>{
      video.muted=true;
      video.play().catch(()=>{});
    });
    player.addEventListener('mouseleave',()=>video.pause());
  }
  video.addEventListener('play',()=>player.classList.add('is-playing'));
  video.addEventListener('pause',()=>player.classList.remove('is-playing'));
  video.addEventListener('ended',()=>player.classList.remove('is-playing'));
  video.addEventListener('error',makeXFallback,{once:true});
  player.append(video,play);
  tweet.replaceWith(player);
});

// Use the same direct sources for the muted decorative homepage reel.
document.querySelectorAll('.hero-social-card iframe').forEach(frame=>{
  const match=frame.src.match(/\/tweet\/(\d+)/);
  const source=match&&window.SOCIAL_VIDEO_SOURCES?.[match[1]];
  if(!source)return;
  const video=document.createElement('video');
  video.src=source.src;
  video.poster=source.poster;
  video.referrerPolicy='no-referrer';
  video.setAttribute('referrerpolicy','no-referrer');
  video.autoplay=true;
  video.muted=true;
  video.defaultMuted=true;
  video.setAttribute('muted','');
  video.loop=true;
  video.playsInline=true;
  video.preload='metadata';
  video.setAttribute('aria-hidden','true');
  video.tabIndex=-1;
  frame.replaceWith(video);
  video.play().catch(()=>{});
});

// On devices with a real hover pointer, preview YouTube interviews in place.
if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.querySelectorAll('.video-card[href*="youtube.com/watch"]').forEach(card=>{
    let preview;
    const startPreview=()=>{
      if(preview)return;
      const url=new URL(card.href);
      const videoId=url.searchParams.get('v');
      const start=parseInt(url.searchParams.get('t'),10)||0;
      if(!videoId)return;
      preview=document.createElement('iframe');
      preview.className='video-hover-preview';
      preview.title=`${card.textContent.trim()} video preview`;
      preview.allow='autoplay; encrypted-media; picture-in-picture';
      preview.allowFullscreen=true;
      preview.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&start=${start}`;
      card.classList.add('is-previewing');
      card.appendChild(preview);
    };
    const stopPreview=()=>{
      if(!preview)return;
      preview.remove();
      preview=undefined;
      card.classList.remove('is-previewing');
    };
    card.addEventListener('mouseenter',startPreview);
    card.addEventListener('mouseleave',stopPreview);
  });
}

// Mobile and touch devices autoplay YouTube work silently as each card enters view.
if(window.matchMedia('(hover: none), (pointer: coarse)').matches){
  const autoplayCards=[...document.querySelectorAll('.video-card[href*="youtube.com/watch"]')];
  const makePreview=card=>{
    if(card.querySelector('.video-hover-preview'))return;
    const url=new URL(card.href);
    const videoId=url.searchParams.get('v');
    const start=parseInt(url.searchParams.get('t'),10)||0;
    if(!videoId)return;
    const preview=document.createElement('iframe');
    preview.className='video-hover-preview';
    preview.title=`${card.querySelector('span')?.textContent.trim()||'Video'} autoplay preview`;
    preview.allow='autoplay; encrypted-media; picture-in-picture';
    preview.allowFullscreen=true;
    preview.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&loop=1&playlist=${encodeURIComponent(videoId)}&start=${start}`;
    card.classList.add('is-previewing');
    card.appendChild(preview);
  };
  const stopPreview=card=>{
    card.querySelector('.video-hover-preview')?.remove();
    card.classList.remove('is-previewing');
  };
  const autoplayObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.isIntersecting?makePreview(entry.target):stopPreview(entry.target));
  },{threshold:.62});
  autoplayCards.forEach(card=>autoplayObserver.observe(card));
}

document.querySelectorAll('[data-filter-gallery]').forEach(gallery=>{
  const filters=[...gallery.querySelectorAll(':scope > .gallery-filters [data-filter]')];
  const panels=[...gallery.querySelectorAll(':scope > .gallery-panel')];
  const loadPanelImages=panel=>{
    panel.querySelectorAll('img[loading="lazy"]').forEach(image=>{
      image.loading='eager';
      image.decode?.().catch(()=>{});
    });
  };
  panels.filter(panel=>!panel.hidden).forEach(loadPanelImages);
  filters.forEach(filter=>{
    filter.addEventListener('click',()=>{
      filters.forEach(item=>{
        const active=item===filter;
        item.classList.toggle('is-active',active);
        item.setAttribute('aria-selected',String(active));
      });
      panels.forEach(panel=>{
        const active=panel.dataset.panel===filter.dataset.filter;
        panel.hidden=!active;
        panel.classList.toggle('is-active',active);
        if(active)loadPanelImages(panel);
      });
    });
  });
});

document.querySelectorAll('.club-letter-picker [data-letter-jump]').forEach(button=>{
  button.addEventListener('click',()=>{
    const picker=button.closest('.stadium-club-gallery');
    const track=picker?.querySelector('.stadium-club-filters');
    const target=[...(track?.querySelectorAll('[data-filter]')||[])].find(item=>item.textContent.trim().toUpperCase().startsWith(button.dataset.letterJump));
    if(!track||!target)return;
    track.scrollTo({left:Math.max(0,target.offsetLeft-track.offsetLeft),behavior:'smooth'});
    button.parentElement.querySelectorAll('button').forEach(item=>item.classList.toggle('is-active',item===button));
  });
});

// Full-screen, natural-ratio preview for photography thumbnails.
const photoImages=[...document.querySelectorAll('.stadium-photo-grid .gallery-item img, .graphic-design-grid .graphic-gallery-item img')];
if(photoImages.length){
  const preview=document.createElement('div');
  preview.className='photo-hover-preview';
  preview.setAttribute('aria-hidden','true');
  const previewImage=document.createElement('img');
  preview.appendChild(previewImage);
  document.body.appendChild(preview);
  const showPreview=image=>{
    previewImage.src=image.currentSrc||image.src;
    previewImage.alt=image.alt;
    preview.classList.add('is-visible');
  };
  const hidePreview=()=>preview.classList.remove('is-visible');
  photoImages.forEach(image=>{
    const item=image.closest('.gallery-item, .graphic-gallery-item');
    item.tabIndex=0;
    item.addEventListener('mouseenter',()=>showPreview(image));
    item.addEventListener('mouseleave',hidePreview);
    item.addEventListener('focus',()=>showPreview(image));
    item.addEventListener('blur',hidePreview);
    if(window.matchMedia('(hover: none), (pointer: coarse)').matches){
      item.addEventListener('click',event=>{
        event.preventDefault();
        showPreview(image);
      });
    }
  });
  preview.addEventListener('click',hidePreview);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hidePreview();});
}

const aboutToggle=document.querySelector('.about-toggle');
const aboutMore=document.querySelector('#about-more');
if(aboutToggle&&aboutMore){
  aboutToggle.addEventListener('click',()=>{
    const isOpen=aboutToggle.getAttribute('aria-expanded')==='true';
    aboutToggle.setAttribute('aria-expanded',String(!isOpen));
    aboutMore.hidden=isOpen;
    aboutToggle.innerHTML=isOpen?'Read more <span>↓</span>':'Read less <span>↑</span>';
  });
}

// Use each club article's own Open Graph feature image instead of a page screenshot.
document.querySelectorAll('.written-article').forEach(article=>{
  const link=article.querySelector('.written-read-more');
  const image=article.querySelector('img');
  if(!link||!image)return;
  image.addEventListener('error',()=>{
    image.remove();
    article.classList.add('without-image');
  },{once:true});
  if(link.hostname.endsWith('suttonunited.net')||link.hostname.endsWith('borehamwoodfootballclub.co.uk')){
    image.src=`https://api.microlink.io/?url=${encodeURIComponent(link.href)}&embed=image.url`;
  }
});

const heroCarousel=document.querySelector('[data-hero-carousel]');
if(heroCarousel){
  const track=heroCarousel.querySelector('.hero-carousel-track');
  const slides=[...track.querySelectorAll('img')];
  const firstClone=slides[0].cloneNode(true);
  const lastClone=slides[slides.length-1].cloneNode(true);
  firstClone.classList.add('hero-loop-clone','hero-loop-first-clone');
  lastClone.classList.add('hero-loop-clone','hero-loop-last-clone');
  firstClone.setAttribute('aria-hidden','true');
  lastClone.setAttribute('aria-hidden','true');
  firstClone.alt='';
  lastClone.alt='';
  track.appendChild(firstClone);
  track.appendChild(lastClone);
  track.style.scrollBehavior='auto';
  track.scrollLeft=track.clientWidth;
  requestAnimationFrame(()=>track.style.removeProperty('scroll-behavior'));
  let wrapTimer;
  let resetting=false;
  track.addEventListener('scroll',()=>{
    if(resetting)return;
    clearTimeout(wrapTimer);
    wrapTimer=setTimeout(()=>{
      const current=Math.round(track.scrollLeft/track.clientWidth);
      if(current>=slides.length+1||current<=0){
        resetting=true;
        track.style.scrollBehavior='auto';
        track.scrollLeft=track.clientWidth*(current<=0?slides.length:1);
        requestAnimationFrame(()=>{
          track.style.removeProperty('scroll-behavior');
          resetting=false;
        });
      }
    },120);
  },{passive:true});
  heroCarousel.querySelectorAll('[data-hero-direction]').forEach(button=>{
    button.addEventListener('click',()=>{
      const direction=button.dataset.heroDirection==='next'?1:-1;
      const current=Math.round(track.scrollLeft/track.clientWidth);
      const target=Math.max(0,Math.min(current+direction,slides.length+1));
      track.scrollTo({left:track.clientWidth*target,behavior:'smooth'});
    });
  });
}

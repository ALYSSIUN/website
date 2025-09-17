
// Mobile menu toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('[data-nav]');
if (toggle && nav){
  toggle.addEventListener('click', () => {
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
  });
}

// UTM propagation on download links
(function(){
  const params = new URLSearchParams(window.location.search);
  if ([...params].length===0) return;
  document.querySelectorAll('a.dlbtn').forEach(a => {
    try{
      const url = new URL(a.href);
      params.forEach((v,k)=> url.searchParams.set(k,v));
      a.href = url.toString();
    }catch(e){}
  });
})();

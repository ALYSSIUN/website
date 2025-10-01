
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('[data-nav]');
if (navToggle && nav){
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Dropdown click toggle for accessibility + mobile
document.querySelectorAll('[data-dropdown]').forEach(dd => {
  const btn = dd.querySelector('.dropbtn');
  const menu = dd.querySelector('.dropdown-content');
  if (!btn || !menu) return;
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown').forEach(x => { if (x!==dd) x.classList.remove('open'); });
    dd.classList.toggle('open');
    const expanded = dd.classList.contains('open');
    btn.setAttribute('aria-expanded', String(expanded));
    e.stopPropagation();
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown').forEach(dd => {
    dd.classList.remove('open');
    const btn = dd.querySelector('.dropbtn');
    if (btn) btn.setAttribute('aria-expanded','false');
  });
});

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

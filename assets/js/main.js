
// Mobile main menu toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('[data-nav]');
if (toggle && nav){
  toggle.addEventListener('click', () => {
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
  });
}

// Dropdown toggle for Explore (mobile + click)
document.querySelectorAll('[data-has-sub]').forEach(group => {
  const btn = group.querySelector('.submenu-toggle');
  const sub = group.querySelector('.subnav');
  if (!btn || !sub) return;
  btn.addEventListener('click', (e) => {
    const open = sub.getAttribute('data-open') === 'true';
    sub.style.display = open ? 'none' : 'block';
    sub.setAttribute('data-open', String(!open));
    btn.setAttribute('aria-expanded', String(!open));
    e.stopPropagation();
  });
});

// Close open dropdowns on outside click
document.addEventListener('click', () => {
  document.querySelectorAll('.subnav[data-open="true"]').forEach(el => {
    el.style.display = 'none';
    el.setAttribute('data-open','false');
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

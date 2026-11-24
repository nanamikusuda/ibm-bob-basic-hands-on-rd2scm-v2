#!/bin/bash
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
REPORT='var r=function(l){return l+": data-theme="+document.documentElement.getAttribute("data-theme")+" pressed="+document.getElementById("theme-toggle").getAttribute("aria-pressed")+" saved="+localStorage.getItem("bob-faq-theme")+" bg="+getComputedStyle(document.body).backgroundColor};'
mk() { # $1=本文JS $2=出力 $3=headに入れるJS(任意)
  sed 's|href="style.css"|href="../../../style.css"|; s|src="bob.svg"|src="../../../bob.svg"|; s|src="faq-data.js"|src="../../../faq-data.js"|; s|src="script.js"|src="../../../script.js"|' ../../../index.html \
    | sed "s|<head>|<head><script>$3</script>|" \
    | sed "s|</body>|<pre id=out></pre><script>$REPORT $1</script></body>|" > "$2"
}
run() { "$C" --headless=new --disable-gpu $2 --virtual-time-budget=3000 --dump-dom "file://$PWD/$1" 2>/dev/null | sed -n '/<pre id="out">/p' | sed 's/<script>.*//'; }
OUT="var o=[];"
echo "== OS=dark, 保存なし"
mk "var o=[];o.push(r('初期'));document.getElementById('out').textContent=o.join(' ; ');" t2.html 'try{localStorage.clear()}catch(e){}'
run t2.html --blink-settings=preferredColorScheme=1
echo "== OS=dark, 保存=light (保存が優先されるか)"
mk "var o=[];o.push(r('初期'));document.getElementById('out').textContent=o.join(' ; ');" t3.html 'try{localStorage.setItem("bob-faq-theme","light")}catch(e){}'
run t3.html --blink-settings=preferredColorScheme=1
echo "== OS=light, 保存=dark"
mk "var o=[];o.push(r('初期'));document.getElementById('out').textContent=o.join(' ; ');" t4.html 'try{localStorage.setItem("bob-faq-theme","dark")}catch(e){}'
run t4.html
echo "== 不正な保存値(foo)は無視される"
mk "var o=[];o.push(r('初期'));document.getElementById('out').textContent=o.join(' ; ');" t5.html 'try{localStorage.setItem("bob-faq-theme","foo")}catch(e){}'
run t5.html
echo "== localStorage が例外を投げる環境でもエラーにならない"
mk "var errs=[];window.addEventListener('error',function(e){errs.push(e.message)});document.getElementById('theme-toggle').click();document.getElementById('out').textContent='click後 data-theme='+document.documentElement.getAttribute('data-theme')+' pressed='+document.getElementById('theme-toggle').getAttribute('aria-pressed')+' errors='+errs.length;" t6.html 'Object.defineProperty(window,"localStorage",{get:function(){throw new Error("denied")}});'
run t6.html

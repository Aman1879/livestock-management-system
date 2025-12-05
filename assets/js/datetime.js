function updateDateTime() {
    let now = new Date();
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    document.getElementById("todayDateDash").innerText = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    document.getElementById("nowTimeDash").innerText = now.toLocaleTimeString(undefined, {hour:'2-digit',minute:'2-digit'});
  }
  updateDateTime(); setInterval(updateDateTime, 30000);
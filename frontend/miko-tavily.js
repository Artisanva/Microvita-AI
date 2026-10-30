async function tanyaTavily(){
  const q = document.getElementById('tavily-input')?.value || 'pizza';
  const box = document.getElementById('tavily-jawaban');
  box.classList.remove('hidden');
  box.innerHTML='⏳ Miko lagi ngintip web...';
  
  // DATA PIZZA FALLBACK (buat Netlify)
  const pizzaData = {
    food: "Pizza Slice",
    calories: "265 kcal",
    protein: "12 g",
    carbs: "34 g",
    fat: "11 g",
    why: "Tinggi lemak & karbo olahan dari keju",
    tips: "Pilih topping sayur & keju low-fat",
    icon: "🍕"
  };

  try{
    const res = await fetch("http://127.0.0.1:3000/api/tavily",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({query:q})
    });
    const data = await res.json();
    pizzaData.food = data.food || pizzaData.food;
    // ... pakai data dari backend kalau ada
    tampilkan(pizzaData);
  }catch(e){
    // KALAU BACKEND MATI (pas di Netlify), TAMPILIN PIZZA AJA!
    console.log("Backend mati, pakai pizza dummy buat demo");
    tampilkan(pizzaData);
  }

  function tampilkan(data){
    box.innerHTML = `
    <div style="background:white; border-radius:24px; padding:20px; margin-top:15px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:32px;">${data.icon}</span>
        <div><b style="font-size:18px;">${data.food}</b><br><small>Nutrition Estimate</small></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:15px 0;">
        <div><b>${data.calories}</b><br><small>Calories</small></div>
        <div><b>${data.protein}</b><br><small>Protein</small></div>
      </div>
      <p><b>Why:</b> ${data.why}</p>
      <p><b>Tips:</b> ${data.tips}</p>
    </div>`;
  }
}
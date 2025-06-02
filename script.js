const ageOptions = document.querySelectorAll('.age-option');

ageOptions.forEach(option => {
  option.addEventListener('click', function() {
    ageOptions.forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');
    const radio = this.querySelector('input[type="radio"]');
    radio.checked = true;
  });
});

const radioOptions = document.querySelectorAll('.radio-option');

radioOptions.forEach(option => {
  option.addEventListener('click', function() {
    const radio = this.querySelector('input[type="radio"]');
    radio.checked = true;
    radioOptions.forEach(opt => opt.style.background = 'rgba(255, 255, 255, 0.1)');
    this.style.background = 'rgba(240, 165, 0, 0.3)';
  });
});

document.getElementById('verdervoor').addEventListener('click', function() {
  const ageSelected = document.querySelector('input[name="age"]:checked');
  const hearingSelected = document.querySelector('input[name="hearing"]:checked');
  
  if (!ageSelected) {
    alert('Selecteer alstublieft uw leeftijd.');
    return;
  }
  
  if (!hearingSelected) {
    alert('Beantwoord alstublieft de vraag over gehoorvermindering.');
    return;
  }
  
  document.getElementById('voorafgaand').style.display = 'none';
  document.getElementById('test-interface').style.display = 'flex';
});

document.getElementById('verdertest').addEventListener('click', function() {
  document.getElementById('test-interface').style.display = 'none';
  document.getElementById('achteraf').style.display = 'block';
  document.body.style.overflow = 'auto';
});

document.getElementById('verderachteraf').addEventListener('click', function() {
  const formData = {
    age: document.querySelector('input[name="age"]:checked')?.value,
    hearing: document.querySelector('input[name="hearing"]:checked')?.value,
    evaluations: {}
  };
  
  for (let i = 1; i <= 9; i++) {
    const slider = document.getElementById(`vraag${i}`);
    if (slider) {
      formData.evaluations[`vraag${i}`] = slider.value;
    }
  }
  
  const feedback = document.getElementById('feedback');
  if (feedback) {
    formData.feedback = feedback.value;
  }
  
  console.log('Form Data:', formData);
  
  alert('Test verzonden! Bedankt voor uw deelname.');
});


document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;
    
    if (activeElement.classList.contains('age-option')) {
      activeElement.click();
    }
    
    if (activeElement.classList.contains('radio-option')) {
      activeElement.click();
    }
  }
});

document.querySelectorAll('.age-option, .radio-option').forEach(element => {
  element.setAttribute('tabindex', '0');
  
  element.addEventListener('focus', function() {
    this.style.outline = '2px solid #f0a500';
    this.style.outlineOffset = '2px';
  });
  
  element.addEventListener('blur', function() {
    this.style.outline = 'none';
  });
});

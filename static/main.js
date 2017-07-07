(function(){
  console.log('loaded');
  let wordContainer = document.getElementById('word').children;
  let allGuessed = true;
  console.log(wordContainer);
  for (var i = 0; i < wordContainer.length; i++) {
    if (wordContainer[i].innerText === "_") {
      allGuessed = false;
    }
  }
  if (allGuessed) {
    document.getElementById('letterInput').disabled = true;
    document.getElementById('submitLetter').disabled = true;
  }

  let form = document.getElementById('submitLetter').addEventListener('click', function(e) {
    let letter = document.getElementById('letterInput').value;
    let url = 'letter/' + letter;
    console.log(url);
    fetch(url, {
      method: 'post',
    });
    location.reload();
    e.preventDefault();
  });
}());

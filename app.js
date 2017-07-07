// https://github.com/tiy-greenville-summer-2017/6.1.1-ScaleExpress
// https://github.com/tiy-greenville-summer-2017/5.4-auth
const express = require('express')
  , path = require('path')
  , mustacheExpress = require('mustache-express')
  , randomWords = require('random-words');
// https://github.com/punkave/random-words

const jsonfile = require('jsonfile')
, gameFile = './game-file.json';

const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

// /variable/:variableId // post or get URL
// console.log(req.params.variableId); // /variable/myVariable
// console.log(req.query.queryId); // /variable/myVariable?queryId=myQuery
// console.log(req.session.key); // cookie value
// return res.sendStatus(200);
// return res.render('index', context);
// return res.redirect('index');

let context = jsonfile.readFileSync(gameFile);
let game = context.game;

function loadGame (game) {
  function generateWord () {
    return randomWords(1)[0];
  }
  let minWordLength = game.minWordLength ? game.minWordLength : 5;
  while (!game.word || game.word.length < minWordLength) {
    game.word = generateWord();
    if (game.word.length >= minWordLength) {
      game.allChars = game.word.split('');
      game.correctChars = Array.from('_'.repeat(game.allChars.length));
      // game.correctChars = Array.apply(null, Array(game.allChars.length));
      game.incorrectChars = [];
      game.turnsLeft = game.defaultTurns;
      (game.turnsLeft === 1) ? game.turnsSyntax = "turn" : game.turnsSyntax = "turns";
      game.message = "";
    }
  }
  console.log(game.word);
  console.log(game.allChars);
  console.log(game.correctChars);
  saveGame(game);
}
loadGame(game);
function checkValidity (game, guessLetter) {
  if (guessLetter.match(/[a-z]/i)) {
    game.message = "";
    return true;
  } else {
    game.message = game.invalidMessage;
    return false;
  }
}
function checkExisting (game, gameLetter) {
  for (let i = 0; i < game.correctChars.length; i++) {
    if (game.correctChars[i] === gameLetter) {
      game.message = game.duplicateMessage;
      return false;
    }
  }
  for (let i = 0; i < game.incorrectChars.length; i++) {
    if (game.incorrectChars[i] === gameLetter) {
      game.message = game.duplicateMessage;
      return false;
    }
  }
  return true;
}
function checkLetter (game, guessLetter) {
  let gotOneCorrect = false;
  for (var i = 0; i < game.allChars.length; i++) {
    if (game.allChars[i] === guessLetter) {
      game.correctChars[i] = guessLetter;
      gotOneCorrect = true;
    }
  }
  if (!gotOneCorrect) {
    game.incorrectChars.push(guessLetter);
    game.turnsLeft--;
  }
  (game.turnsLeft === 1) ? game.turnsSyntax = "turn" : game.turnsSyntax = "turns";
  saveGame(game);
  console.log("gotOneCorrect", gotOneCorrect);
  return gotOneCorrect;
}
function checkGame (game) {
  let win = true;
  for (var i = 0; i < game.correctChars.length; i++) {
    if (game.correctChars[i] === '_') {
      win = false;
    }
  }
  console.log(win);
  if (win) {
    game.message = game.winMessage;
  }
  if (!win && game.turnsLeft < 1) {
    game.message = game.loseMessage;
  }
  return win;
}

function resetGame (game) {
  game.word = '';
  loadGame(game);
}
function saveGame () {
  jsonfile.writeFileSync(gameFile, context, {spaces: 2});
  console.log('checkpoint');
}
app.post('/letter/:letter', function (req, res) {
  let guessLetter = req.params.letter;
  console.log('guessLetter', guessLetter);
  if (checkValidity(game, guessLetter) && checkExisting(game, guessLetter)) {
    checkLetter(game, guessLetter);
    checkGame(game);
  }
  // return res.redirect('index');
});
app.post('/reset', function (req, res) {
  resetGame(game);
  res.redirect('/');
});

// app.use(function(req, res, next){
//   next();
// });
app.get('/', function (req, res) {
  return res.render('index', context);
});

app.listen(3000, function () {
  console.log('Express is listening for connections');
});

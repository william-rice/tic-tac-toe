// Listener alerts Game of input from user
function Listener(game) {
  
  //So you can choose what letter you want to be
  this.ask_marker = function(){
    var choice = window.prompt("Player 1: type X or O to choose your marker");
    if (!["X","O","x","o"].includes(choice)){choice="X"};
    choice=choice.toUpperCase();
    game.marker_chosen(game.board, choice);
  };
  
  // Writes to the DOM, sets up onclick events, and shows the starting board
  this.start_listening = function() {
    for (let row in game.board.grid){
      for (let col in game.board.grid[row]){
        // generate HTML elements
        var child = document.createElement("div");
        child.setAttribute('id', "["+row+","+col+"]");
        child.setAttribute('class','grid-item');
        
        // locate them in the DOM
        var parent = document.getElementById("game_grid");
        parent.appendChild(child);
        
        // set their onclick events
        document.getElementById("["+row+","+col+"]").onclick = function() {
        game.move_event([Number(row), Number(col)]);
        };
      };
    }; 
    // show the starting board
    game.displayer.show_board();
  };
};

// Game alerts the board model and displayer of input
function Game(displayer) {
  this.board = displayer.board;
  this.displayer = displayer;
  this.move_event = function(coords) {
    this.board.model_update(coords, displayer);
    displayer.show_board(this.board);
    displayer.check_winner(this.board);
    displayer.check_tie(this.board);
  };
  
  this.marker_chosen = function(choice="X"){
    this.board.starting_marker = choice;
    this.board
        .second_marker = ['X','O']
        .filter(x=>!this.board.starting_marker.includes(x))[0];
    this.board.marker = this.board.starting_marker;
  };
  
};

// Displayer describes how the model is to be shown
function Displayer(board) {
  this.board = board;
  // Read the model and write it into what I think is called the DOM
  this.show_board = function() {
    for (let row in board.grid){
      for (let col in board.grid[row]){
        document
          .getElementById("["+row+","+col+"]")
          .innerHTML=board.grid[row][col];
      };
    };
    console.log(board.grid, board.turn);
    this.show_errors();
    this.check_winner(board);
    this.check_tie(board);
  };
  
  // How to display the winner
  this.check_winner = function() {
    if (board.winner != null){
      document
        .getElementById("disp")
        .innerHTML="The " + board.winner + "'s win!";
      setTimeout(()=>{program_reset()}, 2000);
    };
  };
  
  // How to display an error
  this.show_errors = function() {
    if (board.err){
      document.getElementById("disp").innerHTML=board.err;
      board.err = false;
    } else {
      document.getElementById("disp").innerHTML="";
    }
  };
  
  // How to display a tie
  this.check_tie = function(){
    if (board.tie===true){
      document.getElementById("disp").innerHTML="Ye tied!";
      setTimeout(()=>{program_reset()}, 2000);
    };
  };
};

// Board stores and updates the model
function Board(dimension) {
  // Data members
  this.grid = Array(dimension)
      .fill()
      .map(()=>Array(dimension).fill(""));
  this.turn = 1;
  this.starting_marker = "X"; //default
  this.second_marker = "O";   //default
  this.marker = this.starting_marker;
  this.winner = null;
  this.err = false;
  this.tie = false;
  
  // Function members
  this.model_update = function(coords) {           
    // Records the placement internally on the model.
    
    let row = coords[0];
    let col = coords[1];
    
    // If coordinates are for a nonempty spot, return an error and don't update board or turn
    if (this.grid[row][col] != ""){
      this.err = "Nope! There's already an "+ this.grid[row][col] + " there.";
      return;
    };
    
    // Otherwise:
    // update the board model with the placement
    this.grid[row][col] = this.marker;
    
    // iterate the turn
    this.turn++;
    
    // iterate the marker
    if (this.turn % 2 == 1){
      this.marker = this.starting_marker;
    } else {
      this.marker = this.second_marker;
    };
    
    // Check for a winner
    this.winner = checkForWinner(this.grid);
    
    // Check for ties
      this.tie = (this.turn > dimension*dimension && this.winner==null);
  };
  
};

// free-floating functions
let checkForWinner = function(grid){
  
  let winner = null;
  
  // check for a winning row
  for (let row in grid){
    if ( grid[row].every(el=>el=="X") || grid[row].every(el=>el=="O") ){
      winner = grid[row][0];
    };
  };
  
  // check for a winning column
    // transpose the matrix:
    let gridT = JSON.parse(JSON.stringify(grid)); // copy
    for (let row in grid){        
      for (let col in grid[row]){ 
        gridT[col][row] = grid[row][col];
      };
    };
  
    // then do the same as above:
    for (let row in gridT){
    if (gridT[row].every(el=>el=="X") || gridT[row].every(el=>el=="O")){
      winner = gridT[row][0];
    };
  };
  
  //check both diagonals
  
    // the "backslash" diagonal:
  let diag = [];
  for (let row in grid){
    for (let col in grid[row]){
      if (row==col){
        diag.push(grid[row][col]);
      };
    };
  };
  if (diag.every(el=>el=="X") || diag.every(el=>el=="O")){
    winner = diag[0];
  };
  
    // the "forward slash" diagonal:
    // Note that i+j=(matrix dimension - 1) along the forward diagonal
  diag = [];
  for (let row in grid){
    for (let col in grid[row]){
      if (Number(row)+Number(col)==grid[row].length-1){
        diag.push(grid[row][col]);
      };
    };
  };
  if (diag.every(el=>el=="X") || diag.every(el=>el=="O")){
  winner = diag[0];
  };
  
  return winner;
};
let set_style = function(dimension) {
  
  // style the grid
  var container = document.getElementById("game_grid");
  let px = "";
  let height = 0;
  for (let i=0; i<dimension; i++){
    px = px + " 100px";
    height += 100;
  };
  container.style["grid-template-columns"] = px;
  container.style["grid-template-rows"] = px;
  container.style.height = String(height) + "px";
  container.style.width = String(height) + "px";
  
  // clear last game's residuals
  container.innerHTML="";
  document.getElementById("disp").innerHTML="";
};
let program_reset = function() {
    var dimension = 3;
    set_style(dimension);
    var b = new Board(dimension);
    var d = new Displayer(b);
    var g = new Game(d);
    var l = new Listener(g);
    //l.ask_marker();
    l.start_listening();
};
program_reset();

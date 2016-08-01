$(document).ready(function() {
/* =========================================================
                CONFIG, CONSTANTS, + GLOBALS
   ========================================================= */
  var SUITS = ['heart','diamond','spade','club'];
  var NUM_ROWS = 7;

  var ROUND = {
    pyramid: [],
    stock: [],
    waste: []
  }

/* =========================================================
                      LOGIC FUNCTIONS
   ========================================================= */

  function make_card(val,suit) {
    if (typeof(val) == 'int') {
      if (val > 0 && val < 14) {
        val = 'v' + val.toString();
      }
      else return -1;
    }
    var c = {suit:suit, val:val};
    return c;
  }

  function make_deck() {
    var deck = [];
    for (var v=1;v<=13;v++) {
      for (var s=0;s<SUITS.length;s++) {
        deck.push(make_card('v'+v.toString(),SUITS[s]));
      }
    }
    return deck;
  }

  function shuffle(deck) {
    for(var j, x, i = deck.length; i; j = Math.floor(Math.random() * i), x = deck[--i], deck[i] = deck[j], deck[j] = x);
    return deck;
  }

  function deal(deck,num_cards) {
    /* note: deck will be modified */
    var dealt_cards = [];
    for (var i=0; i<num_cards;i++) {
      dealt_cards.push(deck.pop());
    }
    return dealt_cards;
  }

  function get_card_value(card) {
    return Number(card.val.substring(1));
  }



  function generate_game(round) {
    var deck = shuffle(make_deck());
    round.pyramid = [];
    for (var i = 1; i <= NUM_ROWS; i++) {
      round.pyramid.push(deal(deck,i));
    };
    round.waste = deal(deck,1);
    round.stock = deck;
    return round;
  }

  function is_valid_move(round,card) {
    var card_v = get_card_value(card);
    var waste_card_v = get_card_value(round.waste[round.waste.length-1]);
    if ((card_v == 1 || card_v == 13) && (waste_card_v == 1 || waste_card_v == 13)) { return true;}
    return (Math.abs(card_v - waste_card_v) == 1);
  }

  function make_move(round,row,col) {
    round.waste.push(make_card(round.pyramid[row][col].val,make_card(round.pyramid[row][col].suit)));
    round.pyramid[row][col] = '';
  }

  function check_game_won(round) {
    for (var i = 0; i < NUM_ROWS; i++) {
      for (var j = 0; j < round.pyramid[i].length; j++) {
        if (round.pyramid[i][j] != '') {
          return false;
        }
      };
    };
    return true;
  }

  function check_game_lost(round) {
    if (round.stock.length != 0) {
      return false;
    }
    var has_lost = true;
    $('#pyramid_board .card:not(.back)').each(function() {
      var classes = $(this).attr('class').split(' ');
      var card = make_card(classes[2],classes[1]);
      if (is_valid_move(round,card)) {
        has_lost = false;
      }
    });
    return has_lost;
  }

  function check_game_objectives(round) {    
    if (check_game_won(round)) {
      player_won();
      return true;
    }
    if (check_game_lost(round)) {
      player_lost();
      return true;
    }    
    return false;
  }
/* =========================================================
                        DOM FUNCTIONS
   ========================================================= */

   function create_alt_text(card) {
    var html = '';
    var VALS = {
      'v1': 'ace',
      'v2': 'two',
      'v3': 'three',
      'v4': 'four',
      'v5': 'five',
      'v6': 'six',
      'v7': 'seven',
      'v8': 'eight',
      'v9': 'nine',
      'v10': 'ten',
      'v11': 'jack',
      'v12': 'queen',
      'v13': 'king'
    };
    html += VALS[card.val];
    html += ' of ';
    html +=  card.suit;
    html += 's';

    return html;
   }
  function make_card_face_html(card) {
    var html = '<div class="card ' + card.suit + ' ' + card.val;
    html += '" alt="' + create_alt_text(card);
    html += '">';
    html += '<div class="top">';
    html += '<div class="number"></div>';
    html += '<div class="suit"></div>';
    html += '</div>';
    html += '<div class="bottom">';
    html += '<div class="number"></div>';
    html += '<div class="suit"></div>';
    html += '</div></div>'
    return html;
  }

  function make_card_back_html() {
    return '<div class="card back"></div>';
  }

  function populate_game(round) {
    // empty everything out from previous games
    $('#pyramid_board').html('');
    $('#stock').html('');
    $('#waste').html('');

    // draw the pyramid
    var row;
    $('#pyramid_board').html('');
    for (var i = 0; i < round.pyramid.length; i++) {
      row = '<div class="row">';
      for (var j = 0; j < round.pyramid[i].length; j++) {        
        if (i==round.pyramid.length-1) {
          row += make_card_face_html(round.pyramid[i][j]);
        }
        else {
          row += make_card_back_html();
        }
      };
      row += '</div>';
      $('#pyramid_board').append(row);
    };

    // draw the stock/waste piles
    $('.pile#stock').html(make_card_back_html());
    $('.pile#waste').html(make_card_face_html(round.waste[0]));
  }

  function draw_move(round,row,col,$card) {
    $('#waste').html($card.clone()); 
    $card.replaceWith('<div class="pile"></div>');

    // check if card above and to the left can be opened
    if (col > 0 && round.pyramid[row][col-1] == '') {
      var $c = $('#pyramid_board .row:nth-child('+(row).toString()+') .card:nth-child('+(col).toString()+')');
      $c.replaceWith(make_card_face_html(round.pyramid[row-1][col-1]));
    }

    // check if card above and to the right can be opened
    if (col < round.pyramid[row].length-1 && round.pyramid[row][col+1] == '') {
      var $c = $('#pyramid_board .row:nth-child('+(row).toString()+') .card:nth-child('+(col+1).toString()+')');
      $c.replaceWith(make_card_face_html(round.pyramid[row-1][col]));
    }    
  }

  function player_won() {
    alert('you won!')
    ask_to_play_again();
  }

  function player_lost() {
    alert('you lost!');
    ask_to_play_again();
  }

  function ask_to_play_again() {
    if (confirm('would you like to play again?')) {
      init_game();
    }
  }
/* =========================================================
                      USER INTERACTIONS
   ========================================================= */

  // player starts game
  $('#start_btn').click(function() {
    init_game();
    $(this).hide();
  });

  // player clicks on a card in the pyramid
  $(document).on('click','#pyramid_board .card', function() {
    // can only click on face up cards
    if ($(this).hasClass('back')) { return; };

    // find out which card was choosen
    var row = $('#pyramid_board .row').index($(this).parent());
    var col = $(this).parent().children().index($(this));    

    if (!is_valid_move(ROUND,ROUND.pyramid[row][col])) {
      // TODO: maybe add alert to let the player know why it's wrong
      alert('you\'re wrong buddy')
      return;
    };

    make_move(ROUND,row,col);
    draw_move(ROUND,row,col,$(this));

    check_game_objectives(ROUND);
  });

  // player gets new card from stock pile
  $(document).on('click','#stock', function() {
    if ($(this).html() == '') { return; }

    if (ROUND.stock.length == 1) {
      $(this).html('');
    }

    ROUND.waste.push(ROUND.stock.pop());
    $('#waste').html(make_card_face_html(ROUND.waste[ROUND.waste.length-1]));
    check_game_objectives(ROUND);
    $('#cards_left').html(ROUND.stock.length.toString());
  });
/* =========================================================
                            MISC.
   ========================================================= */

  function init_game() {
    ROUND = generate_game(ROUND);
    populate_game(ROUND);
  }

  function print_pyramid(round) {
    var row;
    for (var i = 0; i < round.pyramid.length; i++) {
      row = '';
      for (var j = 0; j < round.pyramid[i].length; j++) {
        if (round.pyramid[i][j] == '') {
          row += '***  ';
        }
        else {
          row += round.pyramid[i][j].suit[0]+round.pyramid[i][j].val + '  ';
        }
      };
      console.log(row);
    };
  }
});

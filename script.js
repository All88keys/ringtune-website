$(function() {
  "use strict";

  // GLOBAL-ish VARIABLES
  var progressions = {
    "I": ["V","V","V","IV","IV","IV","ii","ii","vi","I","III","iii"],
    "i": ["VIb","VIb","V","iv"],
    "ii": ["V","V","iii"],
    "III": ["VIIb"],
    "iii": ["IV","IV","I"],
    "IV": ["V","V","V","V","I","I","I","ii"],
    "iv": ["i","VIIb"],
    "V": ["I","I","I","I","I","vi","vi","i","IV"],
    "vi": ["IV","IV","iii"],
    "VIb": ["iv"/*,"III"*/],
    "VIIb": ["i"]
  };
  var playMelody = false;
  var setAsActive = function(index) {
    $("img[data-index=" + index + "]").parent().addClass("active");
    setTimeout(function() {
      $("img[data-index=" + index + "]").parent().removeClass("active");
    }, 1100);
  };
  var playChord = function(note) {
    new Audio("res/sound/" + note + ".mp3").play();
    if(!playMelody)
      return;
    var chord;
    switch(note) {
      case "I": chord = ["I","III","V"]; break;
      case "i": chord = ["I","IIIb","V"]; break;
      case "ii": chord = ["II","IV","VI"]; break;
      case "III": chord = ["III","VIb","VII"]; break;
      case "iii": chord = ["III","V","VII"]; break;
      case "IV": chord = ["IV","VI","I2"]; break;
      case "iv": chord = ["IV","VIb","I2"]; break;
      case "V": chord = ["V","VII","II"]; break;
      case "vi": chord = ["VI","I","III"]; break;
      case "VIb": chord = ["VIb","VII","IIIb"]; break;
      case "VIIb": chord = ["VIIb","II","IV"]; break;
    }
    for(let i = 0; i < 3; i++) {
      setTimeout(function() {
        new Audio("res/sound/" + chord[Math.floor(Math.random()*3)] + ".wav").play();
      }, getLength()/4*(1.3+i));
    }
  };
  var getLength = function() { return 60000/parseInt($("#tempoRange").val()); };
  var used = [];
  var current = "I";

  // HANDLE CLICK OF OPTIONS
  $("#optionsBox").on("click", "img.option", function(event) {
    current = $(this).data("value");
    if(playTimeouts.length == 0 && (!isSelecting || event.originalEvent == undefined))
      playChord(current);
    $("#optionsBox").empty();
    for(var value of progressions[current].filter(function(value, index, array) {
      return index == 0 || value != array[index-1];
    }))
      $("#optionsBox").append("<img data-value='" + value + "' class='option' src='res/icons/" + value + ".png'>");
    used.push(current);
    $("#usedNotes").prepend("<div><img data-index='" + (used.length-1) + "' class='deleteButton' src='res/icons/close.png'><img class='usedNote' data-value='" + current + "' src='res/icons/" + current + ".png'></div>");
    setAsActive(used.length-1);
  });

  // PLAY AND STOP THE MUSIC
  var playTimeouts = [];
  $("#playButton").click(function() {
    $("#playButton").addClass("active");
    for(let i = 0; i < used.length; i++)
      playTimeouts[i] = setTimeout(function() { playChord(used[i]); setAsActive(i); }, i*getLength());
    playTimeouts.push(setTimeout(function() { $("#playButton").click(); }, used.length*getLength()));
  });
  $("#stopButton").click(function() {
    $("#playButton").removeClass("active");
    for(var i of playTimeouts)
      clearTimeout(i);
    playTimeouts = [];
  }); 

  // RANDOMLY SELECT OPTIONS
  var isSelecting = false;
  $("#randomButton").click(function() {
    isSelecting = true;
    for(let i = 0; i < 10; i++) {
      if(used.length == 0) {
        $("img.option").click();
        continue;
      }
      setTimeout(function() {
        var progression = progressions[used[used.length-1]];
        var currentValue = progression[Math.floor(Math.random()*progression.length)];
        $("img.option[data-value=" + currentValue + "]").click();
        setAsActive(used.length-1);
      }, i*getLength());
    }
    setTimeout(function() {
      isSelecting = false;
    }, 10*getLength());
  });

  // CLEAR BUTTONS
  $("#closeButton").click(function() {
    if(confirm("Are you sure you want to delete your current RingTune?")) {
      used = [];
      current = "I";
      $("div#usedNotes").empty();
      $("div#optionsBox").html("<img class='option' data-value='I' src='res/icons/I.png'>");
    }
  });

  // TEMPO CONTROL
  $("#tempoRange").on("input", function() {
    $("#tempoValue").text($(this).val());
  });

  // BACKGROUND IMAGE REPOSITIONING
  $(window).resize(function() {
    $("img#loadingLogo").css({
      top: ($(window).height()-$("img#loadingLogo").height())/2+"px",
      left: ($(window).width()-$("img#loadingLogo").width())/2+"px"
    });
    $("img#backgroundLogo").css({
      top: ($(window).height()-$("img#backgroundLogo").height())/2+"px",
      left: ($(window).width()-$("img#backgroundLogo").width())/2+"px"
    });
  }).resize();
  $("img#loadingLogo").fadeOut(1500);

  // PLAY NOTE IF CLICKED ON (USED LIST)
  $(document).on("click", "img.usedNote", function() {
    playChord($(this).data("value"));    
    setAsActive(parseInt($(this).prev().data("index")));
  });

  // ALLOW DELETION OF ELEMENTS
  $(document).on("click", "img.deleteButton", function() {
    if(used.length <= 1)
      return;
    used.splice(parseInt($(this).data("index")), 1);
    $(this).parent().remove();
    var elems = document.getElementsByClassName("deleteButton");
    for(var i = elems.length-1; i >= 0; i--) {
      elems[i].setAttribute("data-index", i);
    }
  });

  // TOGGLE playMelody VARIABLE
  $("#melodyButton").click(function() {
    $(this).children().last().toggleClass("noBan");
    playMelody = !playMelody;
  });
  
  // ATTEMPT TO USE THE API
  /*$.ajax({
    url: "https://api.hooktheory.com/v1/trends/nodes",
    data: {"cp": "4,2,4"},
    method: "GET",
    dataType: "json",
    headers: {
      "Authorizaton": "Bearer 7008700b22ddff662480256fb05e79c1",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    success: function(data) {
      console.log(data);
    }
  });*/

});

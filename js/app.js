$(document).foundation();

$(document).fuzzy({
    "selectors": [
        ".columns, .column",
        "nav li a",
        "nav, nav a",
        "hr"
    ]
});

// Reflow fuzzy elements when clicking on top nav links
$(function(){
    
    var timeout;
   
    $('nav a').on('click', function(){
        clearTimeout(timeout);

        timeout = setTimeout(function(){
            $.fuzzy.reflow();
        }, 20);

    });
    
});
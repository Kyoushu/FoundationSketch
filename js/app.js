$(document).foundation();

$(function(){
    
    var generateFuzzyBordersTimeout;
    var generateFuzzyBordersDelay = 50;
    
    function generateFuzzyBordersDelayed(){
        clearTimeout(generateFuzzyBordersTimeout);
        generateFuzzyBordersTimeout = setTimeout(generateFuzzyBorders, generateFuzzyBordersDelay);
    }
    
    function generateFuzzyBorders(){
        
        $('.fuzzy--border').each(function(){
       
            var element = $(this);
            var width = element.width();
            var height = element.height();

            var canvas = fuzzy.createBoxCanvas(width, height);

            element.css({
                'background-image': 'url(' + canvas.toDataURL('image/png') + ')'
            });

        });
        
    }
    
    generateFuzzyBorders();
    $(window).on('resize', generateFuzzyBordersDelayed);
    
});
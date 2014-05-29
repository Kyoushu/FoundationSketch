$(document).foundation();

$(function(){
    
    $('.columns').attr('data-fuzzy', 'border');
    $('nav').parent().attr('data-fuzzy', 'fill');
    $('nav a, nav li').attr('data-fuzzy', 'fill');
    
    var rgbRegex = /rgba?\(([0-9]+)[^0-9\)]+([0-9]+)[^0-9\)]+([0-9]+)([^\)]+)?\)/;
    
    function rgbToHex(rgb){
        
        function componentToHex(component) {
            var hex = component.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
        
        var rgbMatch = rgb.match(rgbRegex);
        if(!rgbMatch) return null;
        
        var red = parseInt(rgbMatch[1]);
        var green = parseInt(rgbMatch[2]);
        var blue = parseInt(rgbMatch[3]);
        
        var colour = '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue);
        return colour;

    }
    
    var generateFuzzyBoxesTimeout;
    var generateFuzzyBoxesDelay = 50;
    
    function generateFuzzyBoxesDelayed(){
        clearTimeout(generateFuzzyBoxesTimeout);
        generateFuzzyBoxesTimeout = setTimeout(generateFuzzyBoxes, generateFuzzyBoxesDelay);
    }
    
    function generateFuzzyBoxes(){
        
        $('[data-fuzzy=border]').each(function(){
       
            var element = $(this);
            var width = element.width();
            var height = element.height();

            var canvas = fuzzy.createBorderBoxCanvas(width, height);

            element.css({
                'background-image': 'url(' + canvas.toDataURL('image/png') + ')'
            });

        });
        
        $('[data-fuzzy=fill]').each(function(){
            
            var element = $(this);
            
            if(element.attr('data-fuzzy-colour')){
                var colour = element.attr('data-fuzzy-colour');
            }
            else{
                var rgbMatch = element.css('background').match(rgbRegex);
                var colour = (rgbMatch ? rgbToHex(rgbMatch[0]) : null);
                if(colour){
                    element.attr('data-fuzzy-colour', colour);
                    element.css('background-color', 'rgba(0,0,0,0)');
                }
            }
            
            var width = element.outerWidth();
            var height = element.outerHeight();

            var canvas = fuzzy.createFillBoxCanvas(width, height, undefined, (colour ? colour : fuzzy.defaultColour));

            element.css({
                'background-image': 'url(' + canvas.toDataURL('image/png') + ')'
            });

        });
        
    }
    
    generateFuzzyBoxesDelayed();
    $(window).on('resize', generateFuzzyBoxesDelayed);
    
});
// Based on code written by Jonas Wagner <jonas@29a.ch>
// http://29a.ch/2010/2/10/hand-drawn-lines-algorithm-javascript-canvas-html5

(function($, window, document, undefined){
    
    var fuzzy = (function(){
        
        var fuzzStrength = 5;
        var defaultColour = '#222222';
        var rgbRegex = /rgba?\(([0-9]+)[^0-9\)]+([0-9]+)[^0-9\)]+([0-9]+)([^\)]+)?\)/;
        var generateFuzzyBoxesDelay = 50;
        var inset = 3;
        
        var generateFuzzyBoxesTimeout;
    
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
        
        function fuzz(x, strength){
            return x + Math.random() * strength - strength / 2;
        }

        // estimate the movement of the arm
        // x0: start
        // x1: end
        // t: step from 0 to 1
        function handDrawMovement(x0, x1, t){
            return x0 + (x0-x1)*(
                15 * Math.pow(t, 4) -
                6 * Math.pow(t, 5) -
                10 * Math.pow(t,3)
            );
        }

        // inspired by this paper
        // http://iwi.eldoc.ub.rug.nl/FILES/root/2008/ProcCAGVIMeraj/2008ProcCAGVIMeraj.pdf
        function handDrawLine(ctx, x0, y0, x1, y1, colour){
            
            if(typeof colour === 'undefined') colour = defaultColour;
            
            ctx.strokeStyle = colour;
            ctx.lineWidth = 2;
            ctx.moveTo(x0, y0);

            var d = Math.sqrt( (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) );

            var steps = d / 25;
            if(steps < 4){
                steps = 4;
            }
            
            for(var i = 1; i <= steps; i++){
                
                var t1 = i / steps;
                var t0 = t1 - 1 / steps;
                var xt0 = handDrawMovement(x0, x1, t0);
                var yt0 = handDrawMovement(y0, y1, t0);
                var xt1 = handDrawMovement(x0, x1, t1);
                var yt1 = handDrawMovement(y0, y1, t1);
                
                ctx.quadraticCurveTo(fuzz(xt0, fuzzStrength), fuzz(yt0, fuzzStrength), xt1, yt1);
                ctx.moveTo(xt1, yt1);
                
            }
            
            
        }
        
        function createFillBoxCanvas(width, height, colour){
            
            if(typeof colour === 'undefined') colour = defaultColour;
            
            var canvas = createBorderBoxCanvas(width, height, colour);
            
            var ctx = canvas.getContext('2d');
            
            ctx.rect(inset, inset, width - (inset * 2), height - (inset * 2));
            ctx.fillStyle = colour;
            ctx.fill();
            
            return canvas;
        }
        
        function createBorderBoxCanvas(width, height, colour){
            
            if(typeof colour === 'undefined') colour = defaultColour;
            
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            var ctx = canvas.getContext('2d');
            
            handDrawLine(ctx, inset, inset, width - inset, inset, colour);  // TL > TR
            handDrawLine(ctx, width - inset, inset, width - inset, height - inset, colour); // TR > BR
            handDrawLine(ctx, width, height -inset, inset, height - inset, colour); // BR > BL
            handDrawLine(ctx, inset, height - inset, inset, inset, colour); // BL > TL
            
            ctx.stroke();
            
            return canvas;
            
        }
        
        function initElement(element){
            
            element.attr('data-fuzzy-init', 1);
            
            
        }
        
        function init(options, context){
            options.selectors.forEach(function(index, selector){
                $(selector).each(function(){
                    var element = $(this);
                    initElement(element);
                });
            });
            reflow();
        }
        
        function reflow(){
            
            $('[data-fuzzy-init=1]').each(function(){
                
                var element = $(this);
                var mode = element.attr('data-fuzzy');
                
                var width = element.width();
                var height = element.height();
                
                if(mode === 'fill'){
                    var canvas = fuzzy.createFillBoxCanvas(width, height, '#000000');
                }
                else{
                    var canvas = fuzzy.createBorderBoxCanvas(width, height);
                }
                
                element.css({
                    'background-image': 'url(' + canvas.toDataURL('image/png') + ')'
                });
                
            });
            
            /*

            $('[data-fuzzy=fill]').each(function(){

                

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

                

                element.css({
                    'background-image': 'url(' + canvas.toDataURL('image/png') + ')'
                });

            });
            */

        }
        
        return {
            'init': init,
            'reflow': reflow
            //'defaultColour': defaultColour,
            //'createBorderBoxCanvas': createBorderBoxCanvas,
            //'createFillBoxCanvas': createFillBoxCanvas
        };
        
    })();
    
    
    
    $.fuzzy = fuzzy;
    
    $.fn.fuzzy = function(options){
        
        var defaults = {
            'selectors': []
        };
        
        options = $.extend({}, defaults, options);
        
        $.fuzzy.init(options, this);
        $(window).on('resize', function(){
            $.fuzzy.reflow(); 
        });
    };
    
})(jQuery, window, window.document);
// Based on code written by Jonas Wagner <jonas@29a.ch>
// http://29a.ch/2010/2/10/hand-drawn-lines-algorithm-javascript-canvas-html5

(function($, window, document, undefined){
    
    var fuzzy = (function(){
        
        var defaults = {
            'selectors': [],
            'fuzzStrength': 5,
            'backgroundColor': null,
            'borderColor': '#000000',
            'inheritStyles': true,
            'inset': 2
        };
        
        var regexRgb = /rgba?\(([0-9]+)[^0-9\)]+([0-9]+)[^0-9\)]+([0-9]+)([^\)]+)?\)/;
    
        function rgbToHex(red, green, blue){

            function componentToHex(component) {
                var hex = parseInt(component).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }
            return '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue);

        }
        
        function getStyleColor(style){
            var rgbMatch = style.match(regexRgb);
            
            if(!rgbMatch) return null;
            
            if(typeof rgbMatch[4] !== 'undefined'){
                var alpha = parseInt(rgbMatch[4].match(/[0-9]+$/)[0]);
                if(alpha === 0) return null;
            }
            
            return rgbToHex(rgbMatch[1], rgbMatch[2], rgbMatch[3]);
        }
        
        function getElementBackgroundColor(element){
            var style = element.css('background');
            return getStyleColor(style);
        }
        
        function getElementBorderColor(element){
            var borderWidth = parseInt(element.css('border-width'));
            if(borderWidth === 0) return null;
            var style = element.css('border');
            return getStyleColor(style);
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
        function handDrawLine(ctx, x0, y0, x1, y1, options){
            
            var color = options.borderColor;
            if(color === null && options.backgroundColor !== null){
                color = options.backgroundColor;
            }
            
            if(color === null) return;
            
            ctx.strokeStyle = color;
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
                
                ctx.quadraticCurveTo(fuzz(xt0, options.fuzzStrength), fuzz(yt0, options.fuzzStrength), xt1, yt1);
                ctx.moveTo(xt1, yt1);
                
            }
            
        }
        
        function createBoxCanvas(width, height, options){
            
            var backgroundColor = options.backgroundColor;
            
            var inset = options.inset;
            
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            var ctx = canvas.getContext('2d');
            
            if(backgroundColor !== null){
                ctx.rect(inset, inset, width - (inset * 2), height - (inset * 2));
                ctx.fillStyle = backgroundColor;
                ctx.fill();
            }
            
            handDrawLine(ctx, inset, inset, width - inset, inset, options);  // TL > TR
            handDrawLine(ctx, width - inset, inset, width - inset, height - inset, options); // TR > BR
            handDrawLine(ctx, width, height -inset, inset, height - inset, options); // BR > BL
            handDrawLine(ctx, inset, height - inset, inset, inset, options); // BL > TL
            
            ctx.stroke();
            
            return canvas;
            
        }
        
        function initElement(options, element){
            
            if(options.inheritStyles){
                options.backgroundColor = getElementBackgroundColor(element);
                options.borderColor = getElementBorderColor(element);
            }
            
            element.attr('data-fuzzy', '');
            element.data('fuzzy-options', options);
            
            element.css({
                'border': 'none',
                'background': 'none'
            });
            
        }
        
        function init(options, context){
            
            options.selectors.forEach(function(selector){
                $(context).find(selector).each(function(){
                    
                    var element = $(this);
                    var elementOptions = $.extend({}, options);
                    
                    initElement(elementOptions, element);
                    
                });
            });
            
        }
        
        function reflow(){
            
            $('[data-fuzzy]').each(function(){
                
                var element = $(this);
                var options = element.data('fuzzy-options');
                
                var width = element.width();
                var height = element.height();
                
                var canvas = createBoxCanvas(width, height, options);
                
                element.css({
                    'background-image': 'url(' + canvas.toDataURL('image/png') + ')'
                });
                
            });

        }
        
        return {
            'init': init,
            'reflow': reflow,
            'defaults': defaults
        };
        
    })();
    
    $.fuzzy = fuzzy;
    
    $.fn.fuzzy = function(options){
        
        options = $.extend({}, $.fuzzy.defaults, options);
        
        $.fuzzy.init(options, this);
        
        $(window).on('resize', $.fuzzy.reflow);
        
        setTimeout( $.fuzzy.reflow, 100);
        
    };
    
})(jQuery, window, window.document);
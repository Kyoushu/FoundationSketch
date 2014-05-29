// Based on code written by Jonas Wagner <jonas@29a.ch>
// http://29a.ch/2010/2/10/hand-drawn-lines-algorithm-javascript-canvas-html5

(function($, window, document, undefined){
    
    var fuzzy = (function(){
        
        var defaultFuzzStrength = 4;
        var inset = 3;
        
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
        function handDrawLine(ctx, x0, y0, x1, y1, fuzzStrength){
            
            if(typeof fuzzStrength === 'undefined') fuzzStrength = defaultFuzzStrength;
            
            ctx.strokeStyle = '#000000 ';
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
        
        function createBoxCanvas(width, height, fuzzStrength){
            
            if(typeof fuzzStrength === 'undefined') fuzzStrength = defaultFuzzStrength;
            
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            var ctx = canvas.getContext('2d');
            
            handDrawLine(ctx, inset, inset, width - inset, inset, fuzzStrength);  // TL > TR
            handDrawLine(ctx, width - inset, inset, width - inset, height - inset, fuzzStrength); // TR > BR
            handDrawLine(ctx, width, height -inset, inset, height - inset, fuzzStrength); // BR > BL
            handDrawLine(ctx, inset, height - inset, inset, inset, fuzzStrength); // BL > TL
            
            ctx.stroke();
            
            return canvas;
            
        }
        
        return {
            'createBoxCanvas': createBoxCanvas
        };
        
    })();
    
    window.fuzzy = fuzzy;
    
})(jQuery, window, window.document);
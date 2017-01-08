//rollup -> babel -> browser :)

//import * as $ from '../node_modules/jquery/dist/jquery.js';
//import $ from '../node_modules/jquery/dist/jquery.slim.js';

//UI
import alchemy from './alchemy/alchemy.js';
import d3graph from  './d3/d3.js';

//Yep, only one onload listener, but we only need one
window.onload = function(){
    alchemy.init();
    d3graph.init();
};

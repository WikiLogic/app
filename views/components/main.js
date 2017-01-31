//rollup -> babel -> browser :)

//import * as $ from '../node_modules/jquery/dist/jquery.js';
//import $ from '../node_modules/jquery/dist/jquery.slim.js';


//UI
import alchemy from './alchemy/alchemy.js';
import d3graph from  './d3/d3.js';
import d3v4graph from  './d3v4/d3v4.js';
import search from './search/search.js';
import searchResults from './search-results/search-results.js';
import api from './api/api.js';

//Yep, only one onload listener, but we only need one
window.onload = function(){
    alchemy.init();
    d3graph.init();
    d3v4graph.init();
    search.init();
};

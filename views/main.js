//rollup -> babel -> browser :)

//import * as $ from '../node_modules/jquery/dist/jquery.js';
//import $ from '../node_modules/jquery/dist/jquery.slim.js';

//UI
import alchemy from './components/alchemy/alchemy.js';

//Yep, only one onload listener, but we only need one
window.onload = function(){
    alchemy.init();
};

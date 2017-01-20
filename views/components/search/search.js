"use strict";
import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

/* Listens to any input with the class .js-search-input
 * On enter, it fires the USER_SEARCH_SUBMITTED event along with the search term
 */

export default {
    init: function(){
        $('input.js-search-input').on('keypress', function(e){
            if (e.keyCode == 13) {
                //get the input value
                var term = $('.js-search-input').val();
                //fire!
                eventManager.fire(actions.USER_SEARCH_SUBMITTED, term);
                //It's out of our hands now :) 
            }
        });
    }
}
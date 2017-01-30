"use strict";
import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

/* Listens to any input with the class .js-search-input
 * On enter, it fires of the relevant ..._SUBMITTED event (normal search / ID search / ...?)
 */

export default {
    init: function(){
        $('input.js-search-input').on('keypress', function(e){
            if (e.keyCode == 13) {
                //get the input value
                var term = $('.js-search-input').val();

                if (isNaN(term)) {
                    eventManager.fire(actions.USER_SEARCH_SUBMITTED, term);
                } else {
                    //if the term is just numbers, it's probably an id search
                    eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, term);
                }
            }
        });
    }
}
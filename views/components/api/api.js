"use strict";
import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

/* This is where we talk to the WikiLogic API
 *
 */

eventManager.subscribe(actions.USER_SEARCH_SUBMITTED, function(term){

    //tell the world we're submitting a search (for spinners and the like)
    eventManager.fire(actions.API_SEARCH_SUBMITTED, term);

    $.ajax( "http://localhost:3030/claims?search=" + term).done(function(res) {
        eventManager.fire(actions.API_SEARCH_RETURNED, res.data.matches);
    }).error(function(err){
        eventManager.fire(actions.API_SEARCH_ERRORED, res.data.matches);
        console.error('search error', err);
    });
});

export default {
    init: function(){
        //ping the API & see if it's alive
    }
}

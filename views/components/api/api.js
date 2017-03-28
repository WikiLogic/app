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
        eventManager.fire(actions.API_SEARCH_RETURNED, res.data);
    }).error(function(err){
        eventManager.fire(actions.API_SEARCH_ERRORED, err);
        console.error('search error', err);
    });
});

eventManager.subscribe(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, function(claimid){

    //tell the world we're submitting a search (for spinners and the like)
    eventManager.fire(actions.API_REQUEST_BY_ID_SUBMITTED, claimid);

    $.ajax( "http://localhost:3030/claims/" + claimid).done(function(res) {
        if (!res.data.hasOwnProperty('claim')) {
            eventManager.fire(actions.API_REQUEST_BY_ID_ERRORED, '404');
            return;
        }
        //console.error('res.data', res.data);
        eventManager.fire(actions.API_REQUEST_BY_ID_RETURNED, res.data);
    }).error(function(err){
        eventManager.fire(actions.API_REQUEST_BY_ID_ERRORED, err);
        console.error('search error', err);
    });
});

eventManager.subscribe(actions.ARG_REQUEST_BY_ID_SUBMITTED, function (claimid) {

    //tell the world we're submitting a search (for spinners and the like)
    eventManager.fire(actions.API_REQUEST_BY_ID_SUBMITTED, claimid);

    $.ajax("http://localhost:3030/args/" + claimid).done(function (res) {
        // if (!res.data.hasOwnProperty('claim')) {
        //     eventManager.fire(actions.API_REQUEST_BY_ID_ERRORED, '404');
        //     return;
        // }

        var dataAndOriginalId = { data: res.data, claimid: claimid };
        eventManager.fire(actions.API_ARG_REQUEST_BY_ID_RETURNED, dataAndOriginalId);
    }).error(function (err) {
        eventManager.fire(actions.API_REQUEST_BY_ID_ERRORED, err);
        console.error('search error', err);
    });
});

export default {
    init: function(){
        //ping the API & see if it's alive
    }
}

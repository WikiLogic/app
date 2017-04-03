"use strict";

import eventManager from '../js-helpers/eventManager.js';
import actions from '../js-helpers/actions.js';

/* Listens out for text search results returning.
 * Displays the list of results.
 * Fires an event on click.
 */

eventManager.subscribe(actions.API_SEARCH_RETURNED, function(results){
    var resultsMarkup = ``;
    
    results.claims.forEach(function(claim){

        var status = claim.probability;
        resultsMarkup += `
            <div class="search-result js-search-result" data-claimid="${claim.id}">
                <div class="search-result__text">
                ${claim.text}
                </div>
                <div class="search-result__status-wrap">
                    <div class="search-result__status-bar search-result__status-bar--${status}"></div>
                </div>
            </div>
        `;
    });

    $('.js-search-results-list').html(resultsMarkup);

    //set up event listeners
    $('.js-search-result').off('click');
    $('.js-search-result').on('click', function(e){
        var thisClaimId = $(this).data('claimid');
     
        eventManager.fire(actions.CLAIM_REQUEST_BY_ID_SUBMITTED, thisClaimId);
    });
});

export default {
    init: function(){

    }
}
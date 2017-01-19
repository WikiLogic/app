"use strict";

import eventManager from '../js-helpers/eventManager.js';

export default {
    init: function(){
        $('.js-search-input').on('keypress', function(e){
            console.log('search typing!', e);
            if (e.keyCode == 13) {
                //get the input value, sent it to the API
                var term = $('.js-search-input').val();
                console.log("term", term);
                $.ajax( "http://localhost:3030/claims/" + term).done(function(res) {
                    if (res.data.matches.length > 0) {
                        console.log('claims found', res.data.matches);
                        eventManager.fire('SEARCH_RESULTS', res.data.matches);
                    } else {
                        console.warn('no results returned');
                    }
                }).error(function(err){
                    console.error('search error', err);
                });
            }
        });
    }
}
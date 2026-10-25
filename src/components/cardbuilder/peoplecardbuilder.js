
/**
 * Module for building cards from item data.
 * @module components/cardBuilder/peoplecardbuilder
 */

import cardBuilder from './cardBuilder';
import imageLoader from '../images/imageLoader';

export function buildPeopleCards(items, options) {
    options = Object.assign(options || {}, {
        cardLayout: false,
        centerText: true,
        showTitle: true,
        cardFooterAside: 'none',
        showPersonRoleOrType: true,
        showItemCounts: true,
        cardCssClass: 'personCard',
        defaultCardImageIcon: 'person'
    });
    cardBuilder.buildCards(items, options);
}

/**
 * Adds cards for more people after the ones already in the container, leaving those untouched
 * (unlike buildPeopleCards, which replaces the container's content).
 * @param {Array} items - The people to add.
 * @param {Object} options - The same options buildPeopleCards takes; options.itemsContainer is required.
 */
export function appendPeopleCards(items, options) {
    options = Object.assign(options || {}, {
        cardLayout: false,
        centerText: true,
        showTitle: true,
        cardFooterAside: 'none',
        showPersonRoleOrType: true,
        showItemCounts: true,
        cardCssClass: 'personCard',
        defaultCardImageIcon: 'person'
    });

    if (!items.length || !document.body.contains(options.itemsContainer)) {
        return;
    }

    options.itemsContainer.insertAdjacentHTML('beforeend', cardBuilder.getCardsHtml(items, options));
    imageLoader.lazyChildren(options.itemsContainer);
}

export default {
    buildPeopleCards: buildPeopleCards,
    appendPeopleCards: appendPeopleCards
};

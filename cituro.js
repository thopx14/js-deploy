"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const thisScriptElement = document.getElementById('cituro-ratings-script');
class CannotFetchDataError extends Error {
    constructor(errorObj) {
        super(errorObj.message);
        this.errorObj = errorObj;
    }
    get errorObject() {
        return this.errorObj;
    }
}
function fetchCituroData() {
    return __awaiter(this, void 0, void 0, function* () {
        if (thisScriptElement) {
            const userId = thisScriptElement.getAttribute('data-user-account');
            const limit = thisScriptElement.getAttribute('data-limit');
            const surroundingElementId = thisScriptElement.getAttribute('data-surrounding-element-id');
            if (userId && surroundingElementId) {
                const surroundingElement = document.getElementById(surroundingElementId);
                if (surroundingElement) {
                    const cituro_api_ratings = `https://app.cituro.com/api/ratings/${userId}?limit=${limit}&sort=-createdAt&filter[comment]=!null&[rating]=gte:4`;
                    const response_ratings = yield fetch(cituro_api_ratings);
                    if (!response_ratings.ok) {
                        throw new CannotFetchDataError({
                            message: response_ratings.statusText,
                            surroundingElement: surroundingElement,
                        });
                    }
                    const { data } = yield response_ratings.json();
                    data.forEach((ratingData) => {
                        createRatingElements(surroundingElement, ratingData);
                    });
                }
            }
            else {
                throw new CannotFetchDataError({
                    message: 'Could not extract data-user-account or data-surrounding-element-id or data-surrounding-short-element-id from script. Please provide them!',
                    surroundingElement: null,
                });
            }
        }
        else {
            throw new CannotFetchDataError({
                message: `Please give this script an id of 'cituro-ratings-script'!`,
                surroundingElement: null,
            });
        }
    });
}
function fetchCituroSummaryData() {
    return __awaiter(this, void 0, void 0, function* () {
        if (thisScriptElement) {
            const userId = thisScriptElement.getAttribute('data-user-account');
            const summarySurroundingElementId = thisScriptElement.getAttribute('data-surrounding-short-element-id');
            if (userId && summarySurroundingElementId) {
                const summarySurroundingElement = document.getElementById(summarySurroundingElementId);
                if (summarySurroundingElement) {
                    yield fetchSummaryDataAndDisplayItOnScreen(userId, summarySurroundingElement);
                }
            }
        }
    });
}
function fetchSummaryDataAndDisplayItOnScreen(userId, surroundingElement) {
    return __awaiter(this, void 0, void 0, function* () {
        const cituro_api_summary = `https://app.cituro.com/api/ratings/${userId}/summary`;
        const response_summary = yield fetch(cituro_api_summary);
        if (!response_summary.ok) {
            throw new CannotFetchDataError({
                message: response_summary.statusText,
                surroundingElement: surroundingElement,
            });
        }
        const { data } = yield response_summary.json();
        const ratingElements = data.count;
        if (ratingElements > 0) {
            const avg = data.average;
            const avgContainerElement = document.createElement('div');
            avgContainerElement.classList.add('rating-summary-container');
            const avgRatingText = document.createElement('p');
            avgRatingText.classList.add('rating-summary-text');
            avgRatingText.innerHTML = `<strong>${avg.toFixed(2)}</strong> aus 5 Sternen `;
            const summaryStarsElement = document.createElement('span');
            summaryStarsElement.classList.add('rating-stars');
            const ratingStarsArray = generateRatingStarsSvg(avg);
            summaryStarsElement.append(...ratingStarsArray);
            const ratingLinktoCituroElement = document.createElement('p');
            ratingLinktoCituroElement.classList.add('rating-summary-link-text');
            const linkToCituroRatings = document.createElement('a');
            linkToCituroRatings.setAttribute('href', 'https://app.cituro.com/ratings/claudia-knoblich-ayurveda-yoga-ulm');
            linkToCituroRatings.setAttribute('target', '_blank');
            linkToCituroRatings.textContent = `(${ratingElements} Bewertungen auf cituro.com)`;
            ratingLinktoCituroElement.appendChild(linkToCituroRatings);
            avgContainerElement.appendChild(summaryStarsElement);
            avgContainerElement.appendChild(avgRatingText);
            avgContainerElement.appendChild(ratingLinktoCituroElement);
            surroundingElement.appendChild(avgContainerElement);
            generateJsonLdScriptForRatingSummary(avg.toFixed(2), ratingElements);
        }
    });
}
function generateJsonLdScriptForRatingSummary(avgRating, ratingCount) {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: 'Claudia Knoblich Yoga & Ayurveda',
        description: 'Ayurvedische Ganz- und Teilkörpermassagen, sowie Ernährungs- und Lebensstilberatungen',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            bestRating: '5',
            worstRating: '1',
            ratingCount: ratingCount,
        },
    });
    document.head.appendChild(script);
}
function createRatingElements(surroundingElement, ratingData) {
    const ratingContentElement = document.createElement('div');
    ratingContentElement.classList.add('rating-content');
    const ratingHeaderElement = document.createElement('div');
    ratingHeaderElement.classList.add('rating-header');
    ratingContentElement.appendChild(ratingHeaderElement);
    const customerNameElement = document.createElement('span');
    customerNameElement.classList.add('customer-name');
    customerNameElement.textContent = ratingData.anonymous ? 'Anonym' : ratingData.customerName;
    ratingHeaderElement.appendChild(customerNameElement);
    const starsElement = document.createElement('span');
    starsElement.classList.add('rating-stars');
    starsElement.append(...generateRatingStarsSvg(ratingData.rating));
    ratingHeaderElement.appendChild(starsElement);
    const dateElement = document.createElement('span');
    dateElement.classList.add('rating-date');
    dateElement.textContent = `vom ${new Date(ratingData.createdAt).toLocaleDateString('de-DE')}`;
    ratingHeaderElement.appendChild(dateElement);
    const commentElement = document.createElement('div');
    commentElement.classList.add('rating-comment');
    commentElement.textContent = ratingData.comment;
    ratingContentElement.appendChild(commentElement);
    surroundingElement.appendChild(ratingContentElement);
}
function generateRatingStarsSvg(howMany) {
    const starArray = new Array();
    for (let i = 0; i < howMany; i++) {
        const starSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        starSvg.setAttribute('fill', 'currentColor');
        starSvg.setAttribute('stroke', 'currentColor');
        starSvg.setAttribute('stroke-width', '1.5');
        starSvg.setAttribute('viewBox', '0 0 24 24');
        starSvg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('d', 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z');
        starSvg.appendChild(path);
        starArray.push(starSvg);
    }
    return starArray;
}
function generateSadSmileySvg() {
    const smileySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    smileySvg.setAttribute('fill', 'none');
    smileySvg.setAttribute('stroke', 'currentColor');
    smileySvg.setAttribute('stroke-width', '1.5');
    smileySvg.setAttribute('viewBox', '0 0 24 24');
    smileySvg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', 'M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z');
    smileySvg.appendChild(path);
    smileySvg.id = 'sad-smiley';
    return smileySvg;
}
fetchCituroData().catch((error) => {
    const includedErrorObject = error.errorObject;
    if (includedErrorObject && includedErrorObject.surroundingElement) {
        const ratingErrorElement = document.createElement('div');
        ratingErrorElement.classList.add('rating-error');
        const errorTextParagraph = document.createElement('p');
        errorTextParagraph.classList.add('rating-error-text');
        errorTextParagraph.textContent = 'Fehler beim Laden der Bewertungen!';
        ratingErrorElement.appendChild(errorTextParagraph);
        ratingErrorElement.appendChild(generateSadSmileySvg());
        includedErrorObject.surroundingElement.appendChild(ratingErrorElement);
    }
    console.error('Could not write failure message for rating element. Check the logs!');
});
fetchCituroSummaryData().catch((error) => {
    console.log(error);
});
//# sourceMappingURL=cituro.js.map
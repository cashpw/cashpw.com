(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scaleRecipe = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.scale = void 0;
var tslib_1 = require("tslib");
var convert = require('convert-units');
var spelling = require('american-english');
var pluralize = require('pluralize');
var decimal_js_1 = require("decimal.js");
var parse_ingredient_1 = require("parse-ingredient");
var format_quantity_with_sixteenths_1 = require("format-quantity-with-sixteenths");
var UNIT_OF_MEASURE_CONVERSION = {
    ounce: 'oz',
    pound: 'lb',
    milligram: 'mg',
    gram: 'g',
    kilogram: 'kg',
    teaspoon: 'tsp',
    tablespoon: 'Tbs',
    cup: 'cup',
    pint: 'pnt',
    quart: 'qt',
    gallon: 'gal',
    milliliter: 'ml',
    liter: 'l',
    kiloliter: 'kl'
};
var EXCLUDE_UNITS = [
    't',
    'mcg',
    'mt',
    'fl-oz',
    'in3',
    'ft3',
    'yd3',
    'pnt',
    'mm3',
    'cm3',
    'm3',
    'km3',
    'cl',
    'dl',
    'krm',
    'tsk',
    'msk',
    'kkp',
    'glas',
    'kanna',
];
var IMPERIAL_UNITS = [
    'qt',
    'oz',
    'tsp',
    'Tbs',
    'cup',
    'qt',
    'gal',
];
var TEASPOONS_IN_CUP = 48;
var TABLESPOONS_IN_CUP = 16;
function getCutoffNumber(quantity, unitOfMeasure) {
    if (unitOfMeasure === 'teaspoon' &&
        quantity >= 5 &&
        quantity < TEASPOONS_IN_CUP) {
        return 0.25;
    }
    if (unitOfMeasure === 'tablespoon' &&
        quantity >= 3 &&
        quantity < TABLESPOONS_IN_CUP) {
        return 0.25;
    }
    return 1;
}
function getHumanUnit(singular, plural, value) {
    var pluralizedUnitOfMeasure = (value > 1 ? plural : singular).toLowerCase();
    var unitedStatesSpelling = spelling.toUS(pluralizedUnitOfMeasure.toLowerCase());
    if (unitedStatesSpelling === 'word_not_found') {
        return pluralizedUnitOfMeasure;
    }
    return unitedStatesSpelling;
}
function getBestUnitOfMeasure(quantity, currentUnitOfMeasure) {
    var relevantUnitOfMeasure = UNIT_OF_MEASURE_CONVERSION[currentUnitOfMeasure]
        ? UNIT_OF_MEASURE_CONVERSION[currentUnitOfMeasure]
        : currentUnitOfMeasure;
    var bestUnitOfMeasure;
    try {
        bestUnitOfMeasure = convert(quantity)
            .from(relevantUnitOfMeasure)
            .toBest({
            exclude: EXCLUDE_UNITS,
            cutOffNumber: getCutoffNumber(quantity, currentUnitOfMeasure)
        });
    }
    catch (e) {
        bestUnitOfMeasure = {
            singular: currentUnitOfMeasure,
            plural: pluralize(currentUnitOfMeasure),
            val: quantity,
            unit: currentUnitOfMeasure
        };
    }
    return tslib_1.__assign({}, bestUnitOfMeasure);
}
function isNoUnitIngredient(ingredient) {
    var quantity = ingredient.quantity, quantity2 = ingredient.quantity2, unitOfMeasure = ingredient.unitOfMeasure, unitOfMeasureID = ingredient.unitOfMeasureID;
    return quantity && !quantity2 && !unitOfMeasure && !unitOfMeasureID;
}
function ingredientToString(ingredient) {
    var quantity = ingredient.quantity, quantity2 = ingredient.quantity2, unitOfMeasureID = ingredient.unitOfMeasureID, description = ingredient.description;
    var components = [];
    if (isNoUnitIngredient(ingredient)) {
        var pluralizedDescription = quantity > 1 ? pluralize(description) : description;
        return "".concat(quantity, " ").concat(pluralizedDescription);
    }
    if (unitOfMeasureID) {
        var formatQuantityOptions = {
            tolerance: 0.009
        };
        if (quantity2) {
            var _a = getBestUnitOfMeasure(quantity, unitOfMeasureID), quantityVal = _a.val, unit = _a.unit, singular = _a.singular, plural = _a.plural;
            var quantity2Val = void 0;
            try {
                quantity2Val = convert(quantity2)
                    .from(UNIT_OF_MEASURE_CONVERSION[unitOfMeasureID])
                    .to(unit);
            }
            catch (e) {
                quantity2Val = quantity2;
            }
            var humanUnit = getHumanUnit(singular, plural, quantity2Val);
            if (IMPERIAL_UNITS.includes(unit)) {
                var formattedQuantityVal = (0, format_quantity_with_sixteenths_1.formatQuantity)(quantityVal, formatQuantityOptions);
                var formattedQuantity2Val = (0, format_quantity_with_sixteenths_1.formatQuantity)(quantity2Val, formatQuantityOptions);
                components.push("".concat(formattedQuantityVal, "-").concat(formattedQuantity2Val));
            }
            else {
                components.push("".concat(quantityVal, "-").concat(quantity2Val));
            }
            components.push(humanUnit);
        }
        else {
            var _b = getBestUnitOfMeasure(quantity, unitOfMeasureID), quantityVal = _b.val, singular = _b.singular, plural = _b.plural, unit = _b.unit;
            var humanUnit = getHumanUnit(singular, plural, quantityVal);
            if (IMPERIAL_UNITS.includes(unit)) {
                var formattedQuantityVal = (0, format_quantity_with_sixteenths_1.formatQuantity)(quantityVal, formatQuantityOptions);
                components.push("".concat(formattedQuantityVal));
            }
            else {
                components.push("".concat(quantityVal));
            }
            components.push(humanUnit);
        }
    }
    if (ingredient.description) {
        components.push(ingredient.description);
    }
    return components.join(' ');
}
var QUANTITY_NUMBERS = /(?:([0-9]+ [0-9+]\/[0-9]+)|([0-9+]\/[0-9]+)|([0-9]+\.[0-9]+)|(\.[0-9]+)|([0-9]+))/g;
var IMPROPER_FRACTION = /^([0-9]+) ([0-9]+)\/([0-9]+)/;
var FRACTION = /^([0-9]+)\/([0-9]+)/;
function decimalify(quantity) {
    if (IMPROPER_FRACTION.test(quantity)) {
        var _a = quantity.match(IMPROPER_FRACTION), _ = _a[0], whole = _a[1], numerator = _a[2], denominator = _a[3];
        return new decimal_js_1.Decimal(whole)
            .times(denominator)
            .plus(numerator)
            .dividedBy(denominator);
    }
    if (FRACTION.test(quantity)) {
        var _b = quantity.match(FRACTION), _ = _b[0], numerator = _b[1], denominator = _b[2];
        return new decimal_js_1.Decimal(numerator).dividedBy(denominator);
    }
    return new decimal_js_1.Decimal(quantity);
}
function parseQuantities(ingredient) {
    if (QUANTITY_NUMBERS.test(ingredient)) {
        var quantityNumbers = ingredient
            .match(QUANTITY_NUMBERS)
            .filter(function (match) { return match !== ' '; })
            .map(function (match) { return match.trim(); });
        if (quantityNumbers.length === 0) {
            return {
                quantity: null,
                quantity2: null
            };
        }
        if (quantityNumbers.length === 1) {
            return {
                quantity: decimalify(quantityNumbers[0]),
                quantity2: null
            };
        }
        return {
            quantity: decimalify(quantityNumbers[0]),
            quantity2: decimalify(quantityNumbers[1])
        };
    }
    return {
        quantity: null,
        quantity2: null
    };
}
function scale(ingredient, factor) {
    var parsedIngredient = (0, parse_ingredient_1.parseIngredient)(ingredient.toLowerCase(), {
        normalizeUOM: true,
        allowLeadingOf: true
    })[0];
    var _a = parseQuantities(ingredient), quantity = _a.quantity, quantity2 = _a.quantity2;
    var scaledQuantity = !quantity ? null : quantity.times(factor).toNumber();
    var scaledQuantity2 = !quantity2
        ? null
        : quantity2.times(factor).toNumber();
    return ingredientToString(tslib_1.__assign(tslib_1.__assign({}, parsedIngredient), { quantity: scaledQuantity, quantity2: scaledQuantity2 }));
}
exports.scale = scale;

},{"american-english":2,"convert-units":26,"decimal.js":27,"format-quantity-with-sixteenths":28,"parse-ingredient":49,"pluralize":50,"tslib":51}],2:[function(require,module,exports){
'use strict'

module.exports = {	

	toUS : function(english_word) {
		if(this.us_spelling[english_word.toLowerCase()]) {
			return this.us_spelling[english_word.toLowerCase()];
		}
		return 'word_not_found';
	},

	toUK : function(us_word) {
		if(this.uk_spelling[us_word.toLowerCase()]) {
			return this.uk_spelling[us_word.toLowerCase()];
		}
		return 'word_not_found';
	},

	hasUSDifference : function(english_word) {
		if(this.us_spelling[english_word.toLowerCase()]) {
			return true;
		}
		return false;
	},

	hasUKDifference : function(us_word) {
		if(this.uk_spelling[us_word.toLowerCase()]) {
			return true;
		}
		return false;
	},

	us_spelling : {

		accessorise : 'accessorize',
		accessorised : 'accessorized',
		accessorises : 'accessorizes',
		accessorising : 'accessorizing',
		acclimatisation : 'acclimatization',
		acclimatise : 'acclimatize',
		acclimatised : 'acclimatized',
		acclimatises : 'acclimatizes',
		acclimatising : 'acclimatizing',
		accoutrements : 'accouterments',
		aeon : 'eon',
		aeons : 'eons',
		aerogramme : 'aerogram',
		aerogrammes : 'aerograms',
		aeroplane : 'airplane',
		aeroplanes  : 'airplanes ',
		aesthete : 'esthete',
		aesthetes : 'esthetes',
		aesthetic : 'esthetic',
		aesthetically : 'esthetically',
		aesthetics : 'esthetics',
		aetiology : 'etiology',
		ageing : 'aging',
		aggrandisement : 'aggrandizement',
		agonise : 'agonize',
		agonised : 'agonized',
		agonises : 'agonizes',
		agonising : 'agonizing',
		agonisingly : 'agonizingly',
		almanack : 'almanac',
		almanacks : 'almanacs',
		aluminium : 'aluminum',
		amortisable : 'amortizable',
		amortisation : 'amortization',
		amortisations : 'amortizations',
		amortise : 'amortize',
		amortised : 'amortized',
		amortises : 'amortizes',
		amortising : 'amortizing',
		amphitheatre : 'amphitheater',
		amphitheatres : 'amphitheaters',
		anaemia : 'anemia',
		anaemic : 'anemic',
		anaesthesia : 'anesthesia',
		anaesthetic : 'anesthetic',
		anaesthetics : 'anesthetics',
		anaesthetise : 'anesthetize',
		anaesthetised : 'anesthetized',
		anaesthetises : 'anesthetizes',
		anaesthetising : 'anesthetizing',
		anaesthetist : 'anesthetist',
		anaesthetists : 'anesthetists',
		anaesthetize : 'anesthetize',
		anaesthetized : 'anesthetized',
		anaesthetizes : 'anesthetizes',
		anaesthetizing : 'anesthetizing',
		analogue : 'analog',
		analogues : 'analogs',
		analyse : 'analyze',
		analysed : 'analyzed',
		analyses : 'analyzes',
		analysing : 'analyzing',
		anglicise : 'anglicize',
		anglicised : 'anglicized',
		anglicises : 'anglicizes',
		anglicising : 'anglicizing',
		annualised : 'annualized',
		antagonise : 'antagonize',
		antagonised : 'antagonized',
		antagonises : 'antagonizes',
		antagonising : 'antagonizing',
		apologise : 'apologize',
		apologised : 'apologized',
		apologises : 'apologizes',
		apologising : 'apologizing',
		appal : 'appall',
		appals : 'appalls',
		appetiser : 'appetizer',
		appetisers : 'appetizers',
		appetising : 'appetizing',
		appetisingly : 'appetizingly',
		arbour : 'arbor',
		arbours : 'arbors',
		archaeological : 'archeological',
		archaeologically : 'archeologically',
		archaeologist : 'archeologist',
		archaeologists : 'archeologists',
		archaeology : 'archeology',
		ardour : 'ardor',
		armour : 'armor',
		armoured : 'armored',
		armourer : 'armorer',
		armourers : 'armorers',
		armouries : 'armories',
		armoury : 'armory',
		artefact : 'artifact',
		artefacts : 'artifacts',
		authorise : 'authorize',
		authorised : 'authorized',
		authorises : 'authorizes',
		authorising : 'authorizing',
		axe : 'ax',
		backpedalled : 'backpedaled',
		backpedalling : 'backpedaling',
		bannister : 'banister',
		bannisters : 'banisters',
		baptise : 'baptize',
		baptised : 'baptized',
		baptises : 'baptizes',
		baptising : 'baptizing',
		bastardise : 'bastardize',
		bastardised : 'bastardized',
		bastardises : 'bastardizes',
		bastardising : 'bastardizing',
		battleaxe : 'battleax',
		baulk : 'balk',
		baulked : 'balked',
		baulking : 'balking',
		baulks : 'balks',
		bedevilled : 'bedeviled',
		bedevilling : 'bedeviling',
		behaviour : 'behavior',
		behavioural : 'behavioral',
		behaviourism : 'behaviorism',
		behaviourist : 'behaviorist',
		behaviourists : 'behaviorists',
		behaviours : 'behaviors',
		behove : 'behoove',
		behoved : 'behooved',
		behoves : 'behooves',
		bejewelled : 'bejeweled',
		belabour : 'belabor',
		belaboured : 'belabored',
		belabouring : 'belaboring',
		belabours : 'belabors',
		bevelled : 'beveled',
		bevvies : 'bevies',
		bevvy : 'bevy',
		biassed : 'biased',
		biassing : 'biasing',
		bingeing : 'binging',
		bougainvillaea : 'bougainvillea',
		bougainvillaeas : 'bougainvilleas',
		bowdlerise : 'bowdlerize',
		bowdlerised : 'bowdlerized',
		bowdlerises : 'bowdlerizes',
		bowdlerising : 'bowdlerizing',
		breathalyse : 'breathalyze',
		breathalysed : 'breathalyzed',
		breathalyser : 'breathalyzer',
		breathalysers : 'breathalyzers',
		breathalyses : 'breathalyzes',
		breathalysing : 'breathalyzing',
		brutalise : 'brutalize',
		brutalised : 'brutalized',
		brutalises : 'brutalizes',
		brutalising : 'brutalizing',
		buses : 'busses',
		busing : 'bussing',
		caesarean : 'cesarean',
		caesareans : 'cesareans',
		calibre : 'caliber',
		calibres : 'calibers',
		calliper : 'caliper',
		callipers : 'calipers',
		callisthenics : 'calisthenics',
		canalise : 'canalize',
		canalised : 'canalized',
		canalises : 'canalizes',
		canalising : 'canalizing',
		cancellation : 'cancelation',
		cancellations : 'cancelations',
		cancelled : 'canceled',
		cancelling : 'canceling',
		candour : 'candor',
		cannibalise : 'cannibalize',
		cannibalised : 'cannibalized',
		cannibalises : 'cannibalizes',
		cannibalising : 'cannibalizing',
		canonise : 'canonize',
		canonised : 'canonized',
		canonises : 'canonizes',
		canonising : 'canonizing',
		capitalise : 'capitalize',
		capitalised : 'capitalized',
		capitalises : 'capitalizes',
		capitalising : 'capitalizing',
		caramelise : 'caramelize',
		caramelised : 'caramelized',
		caramelises : 'caramelizes',
		caramelising : 'caramelizing',
		carbonise : 'carbonize',
		carbonised : 'carbonized',
		carbonises : 'carbonizes',
		carbonising : 'carbonizing',
		carolled : 'caroled',
		carolling : 'caroling',
		catalogue : 'catalog',
		catalogued : 'cataloged',
		catalogues : 'catalogs',
		cataloguing : 'cataloging',
		catalyse : 'catalyze',
		catalysed : 'catalyzed',
		catalyses : 'catalyzes',
		catalysing : 'catalyzing',
		categorise : 'categorize',
		categorised : 'categorized',
		categorises : 'categorizes',
		categorising : 'categorizing',
		cauterise : 'cauterize',
		cauterised : 'cauterized',
		cauterises : 'cauterizes',
		cauterising : 'cauterizing',
		cavilled : 'caviled',
		cavilling : 'caviling',
		centigramme : 'centigram',
		centigrammes : 'centigrams',
		centilitre : 'centiliter',
		centilitres : 'centiliters',
		centimetre : 'centimeter',
		centimetres : 'centimeters',
		centralise : 'centralize',
		centralised : 'centralized',
		centralises : 'centralizes',
		centralising : 'centralizing',
		centre : 'center',
		centred : 'centered',
		centrefold : 'centerfold',
		centrefolds : 'centerfolds',
		centrepiece : 'centerpiece',
		centrepieces : 'centerpieces',
		centres : 'centers',
		channelled : 'channeled',
		channelling : 'channeling',
		characterise : 'characterize',
		characterised : 'characterized',
		characterises : 'characterizes',
		characterising : 'characterizing',
		cheque : 'check',
		chequebook : 'checkbook',
		chequebooks : 'checkbooks',
		chequered : 'checkered',
		cheques : 'checks',
		chilli : 'chili',
		chimaera : 'chimera',
		chimaeras : 'chimeras',
		chiselled : 'chiseled',
		chiselling : 'chiseling',
		circularise : 'circularize',
		circularised : 'circularized',
		circularises : 'circularizes',
		circularising : 'circularizing',
		civilise : 'civilize',
		civilised : 'civilized',
		civilises : 'civilizes',
		civilising : 'civilizing',
		clamour : 'clamor',
		clamoured : 'clamored',
		clamouring : 'clamoring',
		clamours : 'clamors',
		clangour : 'clangor',
		clarinettist : 'clarinetist',
		clarinettists : 'clarinetists',
		collectivise : 'collectivize',
		collectivised : 'collectivized',
		collectivises : 'collectivizes',
		collectivising : 'collectivizing',
		colonisation : 'colonization',
		colonise : 'colonize',
		colonised : 'colonized',
		coloniser : 'colonizer',
		colonisers : 'colonizers',
		colonises : 'colonizes',
		colonising : 'colonizing',
		colour : 'color',
		colourant : 'colorant',
		colourants : 'colorants',
		coloured : 'colored',
		coloureds : 'coloreds',
		colourful : 'colorful',
		colourfully : 'colorfully',
		colouring : 'coloring',
		colourize : 'colorize',
		colourized : 'colorized',
		colourizes : 'colorizes',
		colourizing : 'colorizing',
		colourless : 'colorless',
		colours : 'colors',
		commercialise : 'commercialize',
		commercialised : 'commercialized',
		commercialises : 'commercializes',
		commercialising : 'commercializing',
		compartmentalise : 'compartmentalize',
		compartmentalised : 'compartmentalized',
		compartmentalises : 'compartmentalizes',
		compartmentalising : 'compartmentalizing',
		computerise : 'computerize',
		computerised : 'computerized',
		computerises : 'computerizes',
		computerising : 'computerizing',
		conceptualise : 'conceptualize',
		conceptualised : 'conceptualized',
		conceptualises : 'conceptualizes',
		conceptualising : 'conceptualizing',
		connexion : 'connection',
		connexions : 'connections',
		contextualise : 'contextualize',
		contextualised : 'contextualized',
		contextualises : 'contextualizes',
		contextualising : 'contextualizing',
		cosier : 'cozier',
		cosies : 'cozies',
		cosiest : 'coziest',
		cosily : 'cozily',
		cosiness : 'coziness',
		cosy : 'cozy',
		councillor : 'councilor',
		councillors : 'councilors',
		counselled : 'counseled',
		counselling : 'counseling',
		counsellor : 'counselor',
		counsellors : 'counselors',
		crenellated : 'crenelated',
		criminalise : 'criminalize',
		criminalised : 'criminalized',
		criminalises : 'criminalizes',
		criminalising : 'criminalizing',
		criticise : 'criticize',
		criticised : 'criticized',
		criticises : 'criticizes',
		criticising : 'criticizing',
		crueller : 'crueler',
		cruellest : 'cruelest',
		crystallisation : 'crystallization',
		crystallise : 'crystallize',
		crystallised : 'crystallized',
		crystallises : 'crystallizes',
		crystallising : 'crystallizing',
		cudgelled : 'cudgeled',
		cudgelling : 'cudgeling',
		customise : 'customize',
		customised : 'customized',
		customises : 'customizes',
		customising : 'customizing',
		cypher : 'cipher',
		cyphers : 'ciphers',
		decentralisation : 'decentralization',
		decentralise : 'decentralize',
		decentralised : 'decentralized',
		decentralises : 'decentralizes',
		decentralising : 'decentralizing',
		decriminalisation : 'decriminalization',
		decriminalise : 'decriminalize',
		decriminalised : 'decriminalized',
		decriminalises : 'decriminalizes',
		decriminalising : 'decriminalizing',
		defence : 'defense',
		defenceless : 'defenseless',
		defences : 'defenses',
		dehumanisation : 'dehumanization',
		dehumanise : 'dehumanize',
		dehumanised : 'dehumanized',
		dehumanises : 'dehumanizes',
		dehumanising : 'dehumanizing',
		demeanour : 'demeanor',
		demilitarisation : 'demilitarization',
		demilitarise : 'demilitarize',
		demilitarised : 'demilitarized',
		demilitarises : 'demilitarizes',
		demilitarising : 'demilitarizing',
		demobilisation : 'demobilization',
		demobilise : 'demobilize',
		demobilised : 'demobilized',
		demobilises : 'demobilizes',
		demobilising : 'demobilizing',
		democratisation : 'democratization',
		democratise : 'democratize',
		democratised : 'democratized',
		democratises : 'democratizes',
		democratising : 'democratizing',
		demonise : 'demonize',
		demonised : 'demonized',
		demonises : 'demonizes',
		demonising : 'demonizing',
		demoralisation : 'demoralization',
		demoralise : 'demoralize',
		demoralised : 'demoralized',
		demoralises : 'demoralizes',
		demoralising : 'demoralizing',
		denationalisation : 'denationalization',
		denationalise : 'denationalize',
		denationalised : 'denationalized',
		denationalises : 'denationalizes',
		denationalising : 'denationalizing',
		deodorise : 'deodorize',
		deodorised : 'deodorized',
		deodorises : 'deodorizes',
		deodorising : 'deodorizing',
		depersonalise : 'depersonalize',
		depersonalised : 'depersonalized',
		depersonalises : 'depersonalizes',
		depersonalising : 'depersonalizing',
		deputise : 'deputize',
		deputised : 'deputized',
		deputises : 'deputizes',
		deputising : 'deputizing',
		desensitisation : 'desensitization',
		desensitise : 'desensitize',
		desensitised : 'desensitized',
		desensitises : 'desensitizes',
		desensitising : 'desensitizing',
		destabilisation : 'destabilization',
		destabilise : 'destabilize',
		destabilised : 'destabilized',
		destabilises : 'destabilizes',
		destabilising : 'destabilizing',
		dialled : 'dialed',
		dialling : 'dialing',
		dialogue : 'dialog',
		dialogues : 'dialogs',
		diarrhoea : 'diarrhea',
		digitise : 'digitize',
		digitised : 'digitized',
		digitises : 'digitizes',
		digitising : 'digitizing',
		disc : 'disk',
		discolour : 'discolor',
		discoloured : 'discolored',
		discolouring : 'discoloring',
		discolours : 'discolors',
		discs : 'disks',
		disembowelled : 'disemboweled',
		disembowelling : 'disemboweling',
		disfavour : 'disfavor',
		dishevelled : 'disheveled',
		dishonour : 'dishonor',
		dishonourable : 'dishonorable',
		dishonourably : 'dishonorably',
		dishonoured : 'dishonored',
		dishonouring : 'dishonoring',
		dishonours : 'dishonors',
		disorganisation : 'disorganization',
		disorganised : 'disorganized',
		distil : 'distill',
		distils : 'distills',
		dramatisation : 'dramatization',
		dramatisations : 'dramatizations',
		dramatise : 'dramatize',
		dramatised : 'dramatized',
		dramatises : 'dramatizes',
		dramatising : 'dramatizing',
		draught : 'draft',
		draughtboard : 'draftboard',
		draughtboards : 'draftboards',
		draughtier : 'draftier',
		draughtiest : 'draftiest',
		draughts : 'drafts',
		draughtsman : 'draftsman',
		draughtsmanship : 'draftsmanship',
		draughtsmen : 'draftsmen',
		draughtswoman : 'draftswoman',
		draughtswomen : 'draftswomen',
		draughty : 'drafty',
		drivelled : 'driveled',
		drivelling : 'driveling',
		duelled : 'dueled',
		duelling : 'dueling',
		economise : 'economize',
		economised : 'economized',
		economises : 'economizes',
		economising : 'economizing',
		edoema : 'edema ',
		editorialise : 'editorialize',
		editorialised : 'editorialized',
		editorialises : 'editorializes',
		editorialising : 'editorializing',
		empathise : 'empathize',
		empathised : 'empathized',
		empathises : 'empathizes',
		empathising : 'empathizing',
		emphasise : 'emphasize',
		emphasised : 'emphasized',
		emphasises : 'emphasizes',
		emphasising : 'emphasizing',
		enamelled : 'enameled',
		enamelling : 'enameling',
		enamoured : 'enamored',
		encyclopaedia : 'encyclopedia',
		encyclopaedias : 'encyclopedias',
		encyclopaedic : 'encyclopedic',
		endeavour : 'endeavor',
		endeavoured : 'endeavored',
		endeavouring : 'endeavoring',
		endeavours : 'endeavors',
		energise : 'energize',
		energised : 'energized',
		energises : 'energizes',
		energising : 'energizing',
		enrol : 'enroll',
		enrols : 'enrolls',
		enthral : 'enthrall',
		enthrals : 'enthralls',
		epaulette : 'epaulet',
		epaulettes : 'epaulets',
		epicentre : 'epicenter',
		epicentres : 'epicenters',
		epilogue : 'epilog',
		epilogues : 'epilogs',
		epitomise : 'epitomize',
		epitomised : 'epitomized',
		epitomises : 'epitomizes',
		epitomising : 'epitomizing',
		equalisation : 'equalization',
		equalise : 'equalize',
		equalised : 'equalized',
		equaliser : 'equalizer',
		equalisers : 'equalizers',
		equalises : 'equalizes',
		equalising : 'equalizing',
		eulogise : 'eulogize',
		eulogised : 'eulogized',
		eulogises : 'eulogizes',
		eulogising : 'eulogizing',
		evangelise : 'evangelize',
		evangelised : 'evangelized',
		evangelises : 'evangelizes',
		evangelising : 'evangelizing',
		exorcise : 'exorcize',
		exorcised : 'exorcized',
		exorcises : 'exorcizes',
		exorcising : 'exorcizing',
		extemporisation : 'extemporization',
		extemporise : 'extemporize',
		extemporised : 'extemporized',
		extemporises : 'extemporizes',
		extemporising : 'extemporizing',
		externalisation : 'externalization',
		externalisations : 'externalizations',
		externalise : 'externalize',
		externalised : 'externalized',
		externalises : 'externalizes',
		externalising : 'externalizing',
		factorise : 'factorize',
		factorised : 'factorized',
		factorises : 'factorizes',
		factorising : 'factorizing',
		faecal : 'fecal',
		faeces : 'feces',
		familiarisation : 'familiarization',
		familiarise : 'familiarize',
		familiarised : 'familiarized',
		familiarises : 'familiarizes',
		familiarising : 'familiarizing',
		fantasise : 'fantasize',
		fantasised : 'fantasized',
		fantasises : 'fantasizes',
		fantasising : 'fantasizing',
		favour : 'favor',
		favourable : 'favorable',
		favourably : 'favorably',
		favoured : 'favored',
		favouring : 'favoring',
		favourite : 'favorite',
		favourites : 'favorites',
		favouritism : 'favoritism',
		favours : 'favors',
		feminise : 'feminize',
		feminised : 'feminized',
		feminises : 'feminizes',
		feminising : 'feminizing',
		fertilisation : 'fertilization',
		fertilise : 'fertilize',
		fertilised : 'fertilized',
		fertiliser : 'fertilizer',
		fertilisers : 'fertilizers',
		fertilises : 'fertilizes',
		fertilising : 'fertilizing',
		fervour : 'fervor',
		fibre : 'fiber',
		fibreglass : 'fiberglass',
		fibres : 'fibers',
		fictionalisation : 'fictionalization',
		fictionalisations : 'fictionalizations',
		fictionalise : 'fictionalize',
		fictionalised : 'fictionalized',
		fictionalises : 'fictionalizes',
		fictionalising : 'fictionalizing',
		fillet : 'filet',
		filleted  : 'fileted ',
		filleting : 'fileting',
		fillets  : 'filets ',
		finalisation : 'finalization',
		finalise : 'finalize',
		finalised : 'finalized',
		finalises : 'finalizes',
		finalising : 'finalizing',
		flautist : 'flutist',
		flautists : 'flutists',
		flavour : 'flavor',
		flavoured : 'flavored',
		flavouring : 'flavoring',
		flavourings : 'flavorings',
		flavourless : 'flavorless',
		flavours : 'flavors',
		flavoursome : 'flavorsome',
		flyer : 'flier',
		flier: 'flyer',
		foetal : 'fetal',
		foetid : 'fetid',
		foetus : 'fetus',
		foetuses : 'fetuses',
		formalisation : 'formalization',
		formalise : 'formalize',
		formalised : 'formalized',
		formalises : 'formalizes',
		formalising : 'formalizing',
		fossilisation : 'fossilization',
		fossilise : 'fossilize',
		fossilised : 'fossilized',
		fossilises : 'fossilizes',
		fossilising : 'fossilizing',
		fraternisation : 'fraternization',
		fraternise : 'fraternize',
		fraternised : 'fraternized',
		fraternises : 'fraternizes',
		fraternising : 'fraternizing',
		fulfil : 'fulfill',
		fulfilment : 'fulfillment',
		fulfils : 'fulfills',
		funnelled : 'funneled',
		funnelling : 'funneling',
		galvanise : 'galvanize',
		galvanised : 'galvanized',
		galvanises : 'galvanizes',
		galvanising : 'galvanizing',
		gambolled : 'gamboled',
		gambolling : 'gamboling',
		gaol : 'jail',
		gaolbird : 'jailbird',
		gaolbirds : 'jailbirds',
		gaolbreak : 'jailbreak',
		gaolbreaks : 'jailbreaks',
		gaoled : 'jailed',
		gaoler : 'jailer',
		gaolers : 'jailers',
		gaoling : 'jailing',
		gaols : 'jails',
		gases : 'gasses',
		gauge : 'gage',
		gauged : 'gaged',
		gauges : 'gages',
		gauging : 'gaging',
		generalisation : 'generalization',
		generalisations : 'generalizations',
		generalise : 'generalize',
		generalised : 'generalized',
		generalises : 'generalizes',
		generalising : 'generalizing',
		ghettoise : 'ghettoize',
		ghettoised : 'ghettoized',
		ghettoises : 'ghettoizes',
		ghettoising : 'ghettoizing',
		gipsies : 'gypsies',
		glamorise : 'glamorize',
		glamorised : 'glamorized',
		glamorises : 'glamorizes',
		glamorising : 'glamorizing',
		glamour : 'glamor',
		globalisation : 'globalization',
		globalise : 'globalize',
		globalised : 'globalized',
		globalises : 'globalizes',
		globalising : 'globalizing',
		glueing  : 'gluing ',
		goitre : 'goiter',
		goitres : 'goiters',
		gonorrhoea : 'gonorrhea',
		gramme : 'gram',
		grammes : 'grams',
		gravelled : 'graveled',
		grey : 'gray',
		greyed : 'grayed',
		greying : 'graying',
		greyish : 'grayish',
		greyness : 'grayness',
		greys : 'grays',
		grovelled : 'groveled',
		grovelling : 'groveling',
		groyne : 'groin',
		groynes  : 'groins',
		gruelling : 'grueling',
		gruellingly : 'gruelingly',
		gryphon : 'griffin',
		gryphons : 'griffins',
		gynaecological : 'gynecological',
		gynaecologist : 'gynecologist',
		gynaecologists : 'gynecologists',
		gynaecology : 'gynecology',
		haematological : 'hematological',
		haematologist : 'hematologist',
		haematologists : 'hematologists',
		haematology : 'hematology',
		haemoglobin : 'hemoglobin',
		haemophilia : 'hemophilia',
		haemophiliac : 'hemophiliac',
		haemophiliacs : 'hemophiliacs',
		haemorrhage : 'hemorrhage',
		haemorrhaged : 'hemorrhaged',
		haemorrhages : 'hemorrhages',
		haemorrhaging : 'hemorrhaging',
		haemorrhoids : 'hemorrhoids',
		harbour : 'harbor',
		harboured : 'harbored',
		harbouring : 'harboring',
		harbours : 'harbors',
		harmonisation : 'harmonization',
		harmonise : 'harmonize',
		harmonised : 'harmonized',
		harmonises : 'harmonizes',
		harmonising : 'harmonizing',
		homoeopath : 'homeopath',
		homoeopathic : 'homeopathic',
		homoeopaths : 'homeopaths',
		homoeopathy : 'homeopathy',
		homogenise : 'homogenize',
		homogenised : 'homogenized',
		homogenises : 'homogenizes',
		homogenising : 'homogenizing',
		honour : 'honor',
		honourable : 'honorable',
		honourably : 'honorably',
		honoured : 'honored',
		honouring : 'honoring',
		honours : 'honors',
		hospitalisation : 'hospitalization',
		hospitalise : 'hospitalize',
		hospitalised : 'hospitalized',
		hospitalises : 'hospitalizes',
		hospitalising : 'hospitalizing',
		humanise : 'humanize',
		humanised : 'humanized',
		humanises : 'humanizes',
		humanising : 'humanizing',
		humour : 'humor',
		humoured : 'humored',
		humouring : 'humoring',
		humourless : 'humorless',
		humours : 'humors',
		hybridise : 'hybridize',
		hybridised : 'hybridized',
		hybridises : 'hybridizes',
		hybridising : 'hybridizing',
		hypnotise : 'hypnotize',
		hypnotised : 'hypnotized',
		hypnotises : 'hypnotizes',
		hypnotising : 'hypnotizing',
		hypothesise : 'hypothesize',
		hypothesised : 'hypothesized',
		hypothesises : 'hypothesizes',
		hypothesising : 'hypothesizing',
		idealisation : 'idealization',
		idealise : 'idealize',
		idealised : 'idealized',
		idealises : 'idealizes',
		idealising : 'idealizing',
		idolise : 'idolize',
		idolised : 'idolized',
		idolises : 'idolizes',
		idolising : 'idolizing',
		immobilisation : 'immobilization',
		immobilise : 'immobilize',
		immobilised : 'immobilized',
		immobiliser : 'immobilizer',
		immobilisers : 'immobilizers',
		immobilises : 'immobilizes',
		immobilising : 'immobilizing',
		immortalise : 'immortalize',
		immortalised : 'immortalized',
		immortalises : 'immortalizes',
		immortalising : 'immortalizing',
		immunisation : 'immunization',
		immunise : 'immunize',
		immunised : 'immunized',
		immunises : 'immunizes',
		immunising : 'immunizing',
		impanelled : 'impaneled',
		impanelling : 'impaneling',
		imperilled : 'imperiled',
		imperilling : 'imperiling',
		individualise : 'individualize',
		individualised : 'individualized',
		individualises : 'individualizes',
		individualising : 'individualizing',
		industrialise : 'industrialize',
		industrialised : 'industrialized',
		industrialises : 'industrializes',
		industrialising : 'industrializing',
		inflexion : 'inflection',
		inflexions : 'inflections',
		initialise : 'initialize',
		initialised : 'initialized',
		initialises : 'initializes',
		initialising : 'initializing',
		initialled : 'initialed',
		initialling : 'initialing',
		instal : 'install',
		instalment : 'installment',
		instalments : 'installments',
		instals : 'installs',
		instil : 'instill',
		instils : 'instills',
		institutionalisation : 'institutionalization',
		institutionalise : 'institutionalize',
		institutionalised : 'institutionalized',
		institutionalises : 'institutionalizes',
		institutionalising : 'institutionalizing',
		intellectualise : 'intellectualize',
		intellectualised : 'intellectualized',
		intellectualises : 'intellectualizes',
		intellectualising : 'intellectualizing',
		internalisation : 'internalization',
		internalise : 'internalize',
		internalised : 'internalized',
		internalises : 'internalizes',
		internalising : 'internalizing',
		internationalisation : 'internationalization',
		internationalise : 'internationalize',
		internationalised : 'internationalized',
		internationalises : 'internationalizes',
		internationalising : 'internationalizing',
		ionisation : 'ionization',
		ionise : 'ionize',
		ionised : 'ionized',
		ioniser : 'ionizer',
		ionisers : 'ionizers',
		ionises : 'ionizes',
		ionising : 'ionizing',
		italicise : 'italicize',
		italicised : 'italicized',
		italicises : 'italicizes',
		italicising : 'italicizing',
		itemise : 'itemize',
		itemised : 'itemized',
		itemises : 'itemizes',
		itemising : 'itemizing',
		jeopardise : 'jeopardize',
		jeopardised : 'jeopardized',
		jeopardises : 'jeopardizes',
		jeopardising : 'jeopardizing',
		jewelled : 'jeweled',
		jeweller : 'jeweler',
		jewellers : 'jewelers',
		jewellery : 'jewelry',
		judgement  : 'judgment',
		kilogramme : 'kilogram',
		kilogrammes : 'kilograms',
		kilometre : 'kilometer',
		kilometres : 'kilometers',
		labelled : 'labeled',
		labelling : 'labeling',
		labour : 'labor',
		laboured : 'labored',
		labourer : 'laborer',
		labourers : 'laborers',
		labouring : 'laboring',
		labours : 'labors',
		lacklustre : 'lackluster',
		legalisation : 'legalization',
		legalise : 'legalize',
		legalised : 'legalized',
		legalises : 'legalizes',
		legalising : 'legalizing',
		legitimise : 'legitimize',
		legitimised : 'legitimized',
		legitimises : 'legitimizes',
		legitimising : 'legitimizing',
		leukaemia : 'leukemia',
		levelled : 'leveled',
		leveller : 'leveler',
		levellers : 'levelers',
		levelling : 'leveling',
		libelled : 'libeled',
		libelling : 'libeling',
		libellous : 'libelous',
		liberalisation : 'liberalization',
		liberalise : 'liberalize',
		liberalised : 'liberalized',
		liberalises : 'liberalizes',
		liberalising : 'liberalizing',
		licence : 'license',
		licenced : 'licensed',
		licences : 'licenses',
		licencing : 'licensing',
		likeable : 'likable ',
		lionisation : 'lionization',
		lionise : 'lionize',
		lionised : 'lionized',
		lionises : 'lionizes',
		lionising : 'lionizing',
		liquidise : 'liquidize',
		liquidised : 'liquidized',
		liquidiser : 'liquidizer',
		liquidisers : 'liquidizers',
		liquidises : 'liquidizes',
		liquidising : 'liquidizing',
		litre : 'liter',
		litres : 'liters',
		localise : 'localize',
		localised : 'localized',
		localises : 'localizes',
		localising : 'localizing',
		louvre : 'louver',
		louvred : 'louvered',
		louvres : 'louvers ',
		lustre : 'luster',
		magnetise : 'magnetize',
		magnetised : 'magnetized',
		magnetises : 'magnetizes',
		magnetising : 'magnetizing',
		manoeuvrability : 'maneuverability',
		manoeuvrable : 'maneuverable',
		manoeuvre : 'maneuver',
		manoeuvred : 'maneuvered',
		manoeuvres : 'maneuvers',
		manoeuvring : 'maneuvering',
		manoeuvrings : 'maneuverings',
		marginalisation : 'marginalization',
		marginalise : 'marginalize',
		marginalised : 'marginalized',
		marginalises : 'marginalizes',
		marginalising : 'marginalizing',
		marshalled : 'marshaled',
		marshalling : 'marshaling',
		marvelled : 'marveled',
		marvelling : 'marveling',
		marvellous : 'marvelous',
		marvellously : 'marvelously',
		materialisation : 'materialization',
		materialise : 'materialize',
		materialised : 'materialized',
		materialises : 'materializes',
		materialising : 'materializing',
		maximisation : 'maximization',
		maximise : 'maximize',
		maximised : 'maximized',
		maximises : 'maximizes',
		maximising : 'maximizing',
		meagre : 'meager',
		mechanisation : 'mechanization',
		mechanise : 'mechanize',
		mechanised : 'mechanized',
		mechanises : 'mechanizes',
		mechanising : 'mechanizing',
		mediaeval : 'medieval',
		memorialise : 'memorialize',
		memorialised : 'memorialized',
		memorialises : 'memorializes',
		memorialising : 'memorializing',
		memorise : 'memorize',
		memorised : 'memorized',
		memorises : 'memorizes',
		memorising : 'memorizing',
		mesmerise : 'mesmerize',
		mesmerised : 'mesmerized',
		mesmerises : 'mesmerizes',
		mesmerising : 'mesmerizing',
		metabolise : 'metabolize',
		metabolised : 'metabolized',
		metabolises : 'metabolizes',
		metabolising : 'metabolizing',
		metre : 'meter',
		metres : 'meters',
		micrometre : 'micrometer',
		micrometres : 'micrometers',
		militarise : 'militarize',
		militarised : 'militarized',
		militarises : 'militarizes',
		militarising : 'militarizing',
		milligramme : 'milligram',
		milligrammes : 'milligrams',
		millilitre : 'milliliter',
		millilitres : 'milliliters',
		millimetre : 'millimeter',
		millimetres : 'millimeters',
		miniaturisation : 'miniaturization',
		miniaturise : 'miniaturize',
		miniaturised : 'miniaturized',
		miniaturises : 'miniaturizes',
		miniaturising : 'miniaturizing',
		minibuses : 'minibusses ',
		minimise : 'minimize',
		minimised : 'minimized',
		minimises : 'minimizes',
		minimising : 'minimizing',
		misbehaviour : 'misbehavior',
		misdemeanour : 'misdemeanor',
		misdemeanours : 'misdemeanors',
		misspelt : 'misspelled ',
		mitre : 'miter',
		mitres : 'miters',
		mobilisation : 'mobilization',
		mobilise : 'mobilize',
		mobilised : 'mobilized',
		mobilises : 'mobilizes',
		mobilising : 'mobilizing',
		modelled : 'modeled',
		modeller : 'modeler',
		modellers : 'modelers',
		modelling : 'modeling',
		modernise : 'modernize',
		modernised : 'modernized',
		modernises : 'modernizes',
		modernising : 'modernizing',
		moisturise : 'moisturize',
		moisturised : 'moisturized',
		moisturiser : 'moisturizer',
		moisturisers : 'moisturizers',
		moisturises : 'moisturizes',
		moisturising : 'moisturizing',
		monologue : 'monolog',
		monologues : 'monologs',
		monopolisation : 'monopolization',
		monopolise : 'monopolize',
		monopolised : 'monopolized',
		monopolises : 'monopolizes',
		monopolising : 'monopolizing',
		moralise : 'moralize',
		moralised : 'moralized',
		moralises : 'moralizes',
		moralising : 'moralizing',
		motorised : 'motorized',
		mould : 'mold',
		moulded : 'molded',
		moulder : 'molder',
		mouldered : 'moldered',
		mouldering : 'moldering',
		moulders : 'molders',
		mouldier : 'moldier',
		mouldiest : 'moldiest',
		moulding : 'molding',
		mouldings : 'moldings',
		moulds : 'molds',
		mouldy : 'moldy',
		moult : 'molt',
		moulted : 'molted',
		moulting : 'molting',
		moults : 'molts',
		moustache : 'mustache',
		moustached : 'mustached',
		moustaches : 'mustaches',
		moustachioed : 'mustachioed',
		multicoloured : 'multicolored',
		nationalisation : 'nationalization',
		nationalisations : 'nationalizations',
		nationalise : 'nationalize',
		nationalised : 'nationalized',
		nationalises : 'nationalizes',
		nationalising : 'nationalizing',
		naturalisation : 'naturalization',
		naturalise : 'naturalize',
		naturalised : 'naturalized',
		naturalises : 'naturalizes',
		naturalising : 'naturalizing',
		neighbour : 'neighbor',
		neighbourhood : 'neighborhood',
		neighbourhoods : 'neighborhoods',
		neighbouring : 'neighboring',
		neighbourliness : 'neighborliness',
		neighbourly : 'neighborly',
		neighbours : 'neighbors',
		neutralisation : 'neutralization',
		neutralise : 'neutralize',
		neutralised : 'neutralized',
		neutralises : 'neutralizes',
		neutralising : 'neutralizing',
		normalisation : 'normalization',
		normalise : 'normalize',
		normalised : 'normalized',
		normalises : 'normalizes',
		normalising : 'normalizing',
		odour : 'odor',
		odourless : 'odorless',
		odours : 'odors',
		oesophagus : 'esophagus',
		oesophaguses : 'esophaguses',
		oestrogen : 'estrogen',
		offence : 'offense',
		offences : 'offenses',
		omelette : 'omelet',
		omelettes : 'omelets',
		optimise : 'optimize',
		optimised : 'optimized',
		optimises : 'optimizes',
		optimising : 'optimizing',
		organisation : 'organization',
		organisational : 'organizational',
		organisations : 'organizations',
		organise : 'organize',
		organised : 'organized',
		organiser : 'organizer',
		organisers : 'organizers',
		organises : 'organizes',
		organising : 'organizing',
		orthopaedic : 'orthopedic',
		orthopaedics : 'orthopedics',
		ostracise : 'ostracize',
		ostracised : 'ostracized',
		ostracises : 'ostracizes',
		ostracising : 'ostracizing',
		outmanoeuvre : 'outmaneuver',
		outmanoeuvred : 'outmaneuvered',
		outmanoeuvres : 'outmaneuvers',
		outmanoeuvring : 'outmaneuvering',
		overemphasise : 'overemphasize',
		overemphasised : 'overemphasized',
		overemphasises : 'overemphasizes',
		overemphasising : 'overemphasizing',
		oxidisation : 'oxidization',
		oxidise : 'oxidize',
		oxidised : 'oxidized',
		oxidises : 'oxidizes',
		oxidising : 'oxidizing',
		paederast : 'pederast',
		paederasts : 'pederasts',
		paediatric : 'pediatric',
		paediatrician : 'pediatrician',
		paediatricians : 'pediatricians',
		paediatrics : 'pediatrics',
		paedophile : 'pedophile',
		paedophiles : 'pedophiles',
		paedophilia : 'pedophilia',
		palaeolithic : 'paleolithic',
		palaeontologist : 'paleontologist',
		palaeontologists : 'paleontologists',
		palaeontology : 'paleontology',
		panelled : 'paneled',
		panelling : 'paneling',
		panellist : 'panelist',
		panellists : 'panelists',
		paralyse : 'paralyze',
		paralysed : 'paralyzed',
		paralyses : 'paralyzes',
		paralysing : 'paralyzing',
		parcelled : 'parceled',
		parcelling : 'parceling',
		parlour : 'parlor',
		parlours : 'parlors',
		particularise : 'particularize',
		particularised : 'particularized',
		particularises : 'particularizes',
		particularising : 'particularizing',
		passivisation : 'passivization',
		passivise : 'passivize',
		passivised : 'passivized',
		passivises : 'passivizes',
		passivising : 'passivizing',
		pasteurisation : 'pasteurization',
		pasteurise : 'pasteurize',
		pasteurised : 'pasteurized',
		pasteurises : 'pasteurizes',
		pasteurising : 'pasteurizing',
		patronise : 'patronize',
		patronised : 'patronized',
		patronises : 'patronizes',
		patronising : 'patronizing',
		patronisingly : 'patronizingly',
		pedalled : 'pedaled',
		pedalling : 'pedaling',
		pedestrianisation : 'pedestrianization',
		pedestrianise : 'pedestrianize',
		pedestrianised : 'pedestrianized',
		pedestrianises : 'pedestrianizes',
		pedestrianising : 'pedestrianizing',
		penalise : 'penalize',
		penalised : 'penalized',
		penalises : 'penalizes',
		penalising : 'penalizing',
		pencilled : 'penciled',
		pencilling : 'penciling',
		personalise : 'personalize',
		personalised : 'personalized',
		personalises : 'personalizes',
		personalising : 'personalizing',
		pharmacopoeia : 'pharmacopeia',
		pharmacopoeias : 'pharmacopeias',
		philosophise : 'philosophize',
		philosophised : 'philosophized',
		philosophises : 'philosophizes',
		philosophising : 'philosophizing',
		philtre : 'filter',
		philtres : 'filters',
		phoney  : 'phony ',
		plagiarise : 'plagiarize',
		plagiarised : 'plagiarized',
		plagiarises : 'plagiarizes',
		plagiarising : 'plagiarizing',
		plough : 'plow',
		ploughed : 'plowed',
		ploughing : 'plowing',
		ploughman : 'plowman',
		ploughmen : 'plowmen',
		ploughs : 'plows',
		ploughshare : 'plowshare',
		ploughshares : 'plowshares',
		polarisation : 'polarization',
		polarise : 'polarize',
		polarised : 'polarized',
		polarises : 'polarizes',
		polarising : 'polarizing',
		politicisation : 'politicization',
		politicise : 'politicize',
		politicised : 'politicized',
		politicises : 'politicizes',
		politicising : 'politicizing',
		popularisation : 'popularization',
		popularise : 'popularize',
		popularised : 'popularized',
		popularises : 'popularizes',
		popularising : 'popularizing',
		pouffe : 'pouf',
		pouffes : 'poufs',
		practise : 'practice',
		practised : 'practiced',
		practises : 'practices',
		practising  : 'practicing ',
		praesidium : 'presidium',
		praesidiums  : 'presidiums ',
		pressurisation : 'pressurization',
		pressurise : 'pressurize',
		pressurised : 'pressurized',
		pressurises : 'pressurizes',
		pressurising : 'pressurizing',
		pretence : 'pretense',
		pretences : 'pretenses',
		primaeval : 'primeval',
		prioritisation : 'prioritization',
		prioritise : 'prioritize',
		prioritised : 'prioritized',
		prioritises : 'prioritizes',
		prioritising : 'prioritizing',
		privatisation : 'privatization',
		privatisations : 'privatizations',
		privatise : 'privatize',
		privatised : 'privatized',
		privatises : 'privatizes',
		privatising : 'privatizing',
		professionalisation : 'professionalization',
		professionalise : 'professionalize',
		professionalised : 'professionalized',
		professionalises : 'professionalizes',
		professionalising : 'professionalizing',
		programme : 'program',
		programmes : 'programs',
		prologue : 'prolog',
		prologues : 'prologs',
		propagandise : 'propagandize',
		propagandised : 'propagandized',
		propagandises : 'propagandizes',
		propagandising : 'propagandizing',
		proselytise : 'proselytize',
		proselytised : 'proselytized',
		proselytiser : 'proselytizer',
		proselytisers : 'proselytizers',
		proselytises : 'proselytizes',
		proselytising : 'proselytizing',
		psychoanalyse : 'psychoanalyze',
		psychoanalysed : 'psychoanalyzed',
		psychoanalyses : 'psychoanalyzes',
		psychoanalysing : 'psychoanalyzing',
		publicise : 'publicize',
		publicised : 'publicized',
		publicises : 'publicizes',
		publicising : 'publicizing',
		pulverisation : 'pulverization',
		pulverise : 'pulverize',
		pulverised : 'pulverized',
		pulverises : 'pulverizes',
		pulverising : 'pulverizing',
		pummelled : 'pummel',
		pummelling : 'pummeled',
		pyjama : 'pajama',
		pyjamas : 'pajamas',
		pzazz : 'pizzazz',
		quarrelled : 'quarreled',
		quarrelling : 'quarreling',
		radicalise : 'radicalize',
		radicalised : 'radicalized',
		radicalises : 'radicalizes',
		radicalising : 'radicalizing',
		rancour : 'rancor',
		randomise : 'randomize',
		randomised : 'randomized',
		randomises : 'randomizes',
		randomising : 'randomizing',
		rationalisation : 'rationalization',
		rationalisations : 'rationalizations',
		rationalise : 'rationalize',
		rationalised : 'rationalized',
		rationalises : 'rationalizes',
		rationalising : 'rationalizing',
		ravelled : 'raveled',
		ravelling : 'raveling',
		realisable : 'realizable',
		realisation : 'realization',
		realisations : 'realizations',
		realise : 'realize',
		realised : 'realized',
		realises : 'realizes',
		realising : 'realizing',
		recognisable : 'recognizable',
		recognisably : 'recognizably',
		recognisance : 'recognizance',
		recognise : 'recognize',
		recognised : 'recognized',
		recognises : 'recognizes',
		recognising : 'recognizing',
		reconnoitre : 'reconnoiter',
		reconnoitred : 'reconnoitered',
		reconnoitres : 'reconnoiters',
		reconnoitring : 'reconnoitering',
		refuelled : 'refueled',
		refuelling : 'refueling',
		regularisation : 'regularization',
		regularise : 'regularize',
		regularised : 'regularized',
		regularises : 'regularizes',
		regularising : 'regularizing',
		remodelled : 'remodeled',
		remodelling : 'remodeling',
		remould : 'remold',
		remoulded : 'remolded',
		remoulding : 'remolding',
		remoulds : 'remolds',
		reorganisation : 'reorganization',
		reorganisations : 'reorganizations',
		reorganise : 'reorganize',
		reorganised : 'reorganized',
		reorganises : 'reorganizes',
		reorganising : 'reorganizing',
		revelled : 'reveled',
		reveller : 'reveler',
		revellers : 'revelers',
		revelling : 'reveling',
		revitalise : 'revitalize',
		revitalised : 'revitalized',
		revitalises : 'revitalizes',
		revitalising : 'revitalizing',
		revolutionise : 'revolutionize',
		revolutionised : 'revolutionized',
		revolutionises : 'revolutionizes',
		revolutionising : 'revolutionizing',
		rhapsodise : 'rhapsodize',
		rhapsodised : 'rhapsodized',
		rhapsodises : 'rhapsodizes',
		rhapsodising : 'rhapsodizing',
		rigour : 'rigor',
		rigours : 'rigors',
		ritualised : 'ritualized',
		rivalled : 'rivaled',
		rivalling : 'rivaling',
		romanticise : 'romanticize',
		romanticised : 'romanticized',
		romanticises : 'romanticizes',
		romanticising : 'romanticizing',
		rumour : 'rumor',
		rumoured : 'rumored',
		rumours : 'rumors',
		sabre : 'saber',
		sabres : 'sabers',
		saltpetre : 'saltpeter',
		sanitise : 'sanitize',
		sanitised : 'sanitized',
		sanitises : 'sanitizes',
		sanitising : 'sanitizing',
		satirise : 'satirize',
		satirised : 'satirized',
		satirises : 'satirizes',
		satirising : 'satirizing',
		saviour : 'savior',
		saviours : 'saviors',
		savour : 'savor',
		savoured : 'savored',
		savouries : 'savories',
		savouring : 'savoring',
		savours : 'savors',
		savoury : 'savory',
		scandalise : 'scandalize',
		scandalised : 'scandalized',
		scandalises : 'scandalizes',
		scandalising : 'scandalizing',
		sceptic : 'skeptic',
		sceptical : 'skeptical',
		sceptically : 'skeptically',
		scepticism : 'skepticism',
		sceptics : 'skeptics',
		sceptre : 'scepter',
		sceptres : 'scepters',
		scrutinise : 'scrutinize',
		scrutinised : 'scrutinized',
		scrutinises : 'scrutinizes',
		scrutinising : 'scrutinizing',
		secularisation : 'secularization',
		secularise : 'secularize',
		secularised : 'secularized',
		secularises : 'secularizes',
		secularising : 'secularizing',
		sensationalise : 'sensationalize',
		sensationalised : 'sensationalized',
		sensationalises : 'sensationalizes',
		sensationalising : 'sensationalizing',
		sensitise : 'sensitize',
		sensitised : 'sensitized',
		sensitises : 'sensitizes',
		sensitising : 'sensitizing',
		sentimentalise : 'sentimentalize',
		sentimentalised : 'sentimentalized',
		sentimentalises : 'sentimentalizes',
		sentimentalising : 'sentimentalizing',
		sepulchre : 'sepulcher',
		sepulchres : 'sepulchers ',
		serialisation : 'serialization',
		serialisations : 'serializations',
		serialise : 'serialize',
		serialised : 'serialized',
		serialises : 'serializes',
		serialising : 'serializing',
		sermonise : 'sermonize',
		sermonised : 'sermonized',
		sermonises : 'sermonizes',
		sermonising : 'sermonizing',
		sheikh  : 'sheik ',
		shovelled : 'shoveled',
		shovelling : 'shoveling',
		shrivelled : 'shriveled',
		shrivelling : 'shriveling',
		signalise : 'signalize',
		signalised : 'signalized',
		signalises : 'signalizes',
		signalising : 'signalizing',
		signalled : 'signaled',
		signalling : 'signaling',
		smoulder : 'smolder',
		smouldered : 'smoldered',
		smouldering : 'smoldering',
		smoulders : 'smolders',
		snivelled : 'sniveled',
		snivelling : 'sniveling',
		snorkelled : 'snorkeled',
		snorkelling : 'snorkeling',
		snowplough : 'snowplow',
		snowploughs : 'snowplow',
		socialisation : 'socialization',
		socialise : 'socialize',
		socialised : 'socialized',
		socialises : 'socializes',
		socialising : 'socializing',
		sodomise : 'sodomize',
		sodomised : 'sodomized',
		sodomises : 'sodomizes',
		sodomising : 'sodomizing',
		solemnise : 'solemnize',
		solemnised : 'solemnized',
		solemnises : 'solemnizes',
		solemnising : 'solemnizing',
		sombre : 'somber',
		specialisation : 'specialization',
		specialisations : 'specializations',
		specialise : 'specialize',
		specialised : 'specialized',
		specialises : 'specializes',
		specialising : 'specializing',
		spectre : 'specter',
		spectres : 'specters',
		spiralled : 'spiraled',
		spiralling : 'spiraling',
		splendour : 'splendor',
		splendours : 'splendors',
		squirrelled : 'squirreled',
		squirrelling : 'squirreling',
		stabilisation : 'stabilization',
		stabilise : 'stabilize',
		stabilised : 'stabilized',
		stabiliser : 'stabilizer',
		stabilisers : 'stabilizers',
		stabilises : 'stabilizes',
		stabilising : 'stabilizing',
		standardisation : 'standardization',
		standardise : 'standardize',
		standardised : 'standardized',
		standardises : 'standardizes',
		standardising : 'standardizing',
		stencilled : 'stenciled',
		stencilling : 'stenciling',
		sterilisation : 'sterilization',
		sterilisations : 'sterilizations',
		sterilise : 'sterilize',
		sterilised : 'sterilized',
		steriliser : 'sterilizer',
		sterilisers : 'sterilizers',
		sterilises : 'sterilizes',
		sterilising : 'sterilizing',
		stigmatisation : 'stigmatization',
		stigmatise : 'stigmatize',
		stigmatised : 'stigmatized',
		stigmatises : 'stigmatizes',
		stigmatising : 'stigmatizing',
		storey : 'story',
		storeys : 'stories',
		subsidisation : 'subsidization',
		subsidise : 'subsidize',
		subsidised : 'subsidized',
		subsidiser : 'subsidizer',
		subsidisers : 'subsidizers',
		subsidises : 'subsidizes',
		subsidising : 'subsidizing',
		succour : 'succor',
		succoured : 'succored',
		succouring : 'succoring',
		succours : 'succors',
		sulphate : 'sulfate',
		sulphates : 'sulfates',
		sulphide : 'sulfide',
		sulphides : 'sulfides',
		sulphur : 'sulfur',
		sulphurous : 'sulfurous',
		summarise : 'summarize',
		summarised : 'summarized',
		summarises : 'summarizes',
		summarising : 'summarizing',
		swivelled : 'swiveled',
		swivelling : 'swiveling',
		symbolise : 'symbolize',
		symbolised : 'symbolized',
		symbolises : 'symbolizes',
		symbolising : 'symbolizing',
		sympathise : 'sympathize',
		sympathised : 'sympathized',
		sympathiser : 'sympathizer',
		sympathisers : 'sympathizers',
		sympathises : 'sympathizes',
		sympathising : 'sympathizing',
		synchronisation : 'synchronization',
		synchronise : 'synchronize',
		synchronised : 'synchronized',
		synchronises : 'synchronizes',
		synchronising : 'synchronizing',
		synthesise : 'synthesize',
		synthesised : 'synthesized',
		synthesiser : 'synthesizer',
		synthesisers : 'synthesizers',
		synthesises : 'synthesizes',
		synthesising : 'synthesizing',
		syphon : 'siphon',
		syphoned : 'siphoned',
		syphoning : 'siphoning',
		syphons : 'siphons',
		systematisation : 'systematization',
		systematise : 'systematize',
		systematised : 'systematized',
		systematises : 'systematizes',
		systematising : 'systematizing',
		tantalise : 'tantalize',
		tantalised : 'tantalized',
		tantalises : 'tantalizes',
		tantalising : 'tantalizing',
		tantalisingly : 'tantalizingly',
		tasselled : 'tasseled',
		technicolour : 'technicolor',
		temporise : 'temporize',
		temporised : 'temporized',
		temporises : 'temporizes',
		temporising : 'temporizing',
		tenderise : 'tenderize',
		tenderised : 'tenderized',
		tenderises : 'tenderizes',
		tenderising : 'tenderizing',
		terrorise : 'terrorize',
		terrorised : 'terrorized',
		terrorises : 'terrorizes',
		terrorising : 'terrorizing',
		theatre : 'theater',
		theatregoer : 'theatergoer',
		theatregoers : 'theatergoers',
		theatres : 'theaters',
		theorise : 'theorize',
		theorised : 'theorized',
		theorises : 'theorizes',
		theorising : 'theorizing',
		tonne : 'ton',
		tonnes : 'tons',
		towelled : 'toweled',
		towelling : 'toweling',
		toxaemia : 'toxemia',
		tranquillise : 'tranquilize',
		tranquillised : 'tranquilized',
		tranquilliser : 'tranquilizer',
		tranquillisers : 'tranquilizers',
		tranquillises : 'tranquilizes',
		tranquillising : 'tranquilizing',
		tranquillity : 'tranquility',
		tranquillize : 'tranquilize',
		tranquillized : 'tranquilized',
		tranquillizer : 'tranquilizer',
		tranquillizers : 'tranquilizers',
		tranquillizes : 'tranquilizes',
		tranquillizing : 'tranquilizing',
		tranquilly : 'tranquility',
		transistorised : 'transistorized',
		traumatise : 'traumatize',
		traumatised : 'traumatized',
		traumatises : 'traumatizes',
		traumatising : 'traumatizing',
		travelled : 'traveled',
		traveller : 'traveler',
		travellers : 'travelers',
		travelling : 'traveling',
		travelogue : 'travelog',
		travelogues  : 'travelogs ',
		trialled : 'trialed',
		trialling : 'trialing',
		tricolour : 'tricolor',
		tricolours : 'tricolors',
		trivialise : 'trivialize',
		trivialised : 'trivialized',
		trivialises : 'trivializes',
		trivialising : 'trivializing',
		tumour : 'tumor',
		tumours : 'tumors',
		tunnelled : 'tunneled',
		tunnelling : 'tunneling',
		tyrannise : 'tyrannize',
		tyrannised : 'tyrannized',
		tyrannises : 'tyrannizes',
		tyrannising : 'tyrannizing',
		tyre : 'tire',
		tyres : 'tires',
		unauthorised : 'unauthorized',
		uncivilised : 'uncivilized',
		underutilised : 'underutilized',
		unequalled : 'unequaled',
		unfavourable : 'unfavorable',
		unfavourably : 'unfavorably',
		unionisation : 'unionization',
		unionise : 'unionize',
		unionised : 'unionized',
		unionises : 'unionizes',
		unionising : 'unionizing',
		unorganised : 'unorganized',
		unravelled : 'unraveled',
		unravelling : 'unraveling',
		unrecognisable : 'unrecognizable',
		unrecognised : 'unrecognized',
		unrivalled : 'unrivaled',
		unsavoury : 'unsavory',
		untrammelled : 'untrammeled',
		urbanisation : 'urbanization',
		urbanise : 'urbanize',
		urbanised : 'urbanized',
		urbanises : 'urbanizes',
		urbanising : 'urbanizing',
		utilisable : 'utilizable',
		utilisation : 'utilization',
		utilise : 'utilize',
		utilised : 'utilized',
		utilises : 'utilizes',
		utilising : 'utilizing',
		valour : 'valor',
		vandalise : 'vandalize',
		vandalised : 'vandalized',
		vandalises : 'vandalizes',
		vandalising : 'vandalizing',
		vaporisation : 'vaporization',
		vaporise : 'vaporize',
		vaporised : 'vaporized',
		vaporises : 'vaporizes',
		vaporising : 'vaporizing',
		vapour : 'vapor',
		vapours : 'vapors',
		verbalise : 'verbalize',
		verbalised : 'verbalized',
		verbalises : 'verbalizes',
		verbalising : 'verbalizing',
		victimisation : 'victimization',
		victimise : 'victimize',
		victimised : 'victimized',
		victimises : 'victimizes',
		victimising : 'victimizing',
		videodisc : 'videodisk',
		videodiscs : 'videodisks',
		vigour : 'vigor',
		visualisation : 'visualization',
		visualisations : 'visualizations',
		visualise : 'visualize',
		visualised : 'visualized',
		visualises : 'visualizes',
		visualising : 'visualizing',
		vocalisation : 'vocalization',
		vocalisations : 'vocalizations',
		vocalise : 'vocalize',
		vocalised : 'vocalized',
		vocalises : 'vocalizes',
		vocalising : 'vocalizing',
		vulcanised : 'vulcanized',
		vulgarisation : 'vulgarization',
		vulgarise : 'vulgarize',
		vulgarised : 'vulgarized',
		vulgarises : 'vulgarizes',
		vulgarising : 'vulgarizing',
		waggon : 'wagon',
		waggons : 'wagons',
		watercolour : 'watercolor',
		watercolours : 'watercolors',
		weaselled : 'weaseled',
		weaselling : 'weaseling',
		westernisation : 'westernization',
		westernise : 'westernize',
		westernised : 'westernized',
		westernises : 'westernizes',
		westernising : 'westernizing',
		womanise : 'womanize',
		womanised : 'womanized',
		womaniser : 'womanizer',
		womanisers : 'womanizers',
		womanises : 'womanizes',
		womanising : 'womanizing',
		woollen : 'woolen',
		woollens : 'woolens',
		woollies : 'woolies',
		woolly : 'wooly',
		worshipped  : 'worshiped',
		worshipping  : 'worshiping ',
		worshipper : 'worshiper',
		yodelled : 'yodeled',
		yodelling : 'yodeling',
		yoghourt : 'yogurt',
		yoghourts : 'yogurts',
		yoghurt : 'yogurt',
		yoghurts : 'yogurts',
	},

	uk_spelling : {
		accessorize : 'accessorise',
		accessorized : 'accessorised',
		accessorizes : 'accessorises',
		accessorizing : 'accessorising',
		acclimatization : 'acclimatisation',
		acclimatize : 'acclimatise',
		acclimatized : 'acclimatised',
		acclimatizes : 'acclimatises',
		acclimatizing : 'acclimatising',
		accouterments : 'accoutrements',
		eon : 'aeon',
		eons : 'aeons',
		aerogram : 'aerogramme',
		aerograms : 'aerogrammes',
		airplane : 'aeroplane',
		airplanes  : 'aeroplanes ',
		esthete : 'aesthete',
		esthetes : 'aesthetes',
		esthetic : 'aesthetic',
		esthetically : 'aesthetically',
		esthetics : 'aesthetics',
		etiology : 'aetiology',
		aging : 'ageing',
		aggrandizement : 'aggrandisement',
		agonize : 'agonise',
		agonized : 'agonised',
		agonizes : 'agonises',
		agonizing : 'agonising',
		agonizingly : 'agonisingly',
		almanac : 'almanack',
		almanacs : 'almanacks',
		aluminum : 'aluminium',
		amortizable : 'amortisable',
		amortization : 'amortisation',
		amortizations : 'amortisations',
		amortize : 'amortise',
		amortized : 'amortised',
		amortizes : 'amortises',
		amortizing : 'amortising',
		amphitheater : 'amphitheatre',
		amphitheaters : 'amphitheatres',
		anemia : 'anaemia',
		anemic : 'anaemic',
		anesthesia : 'anaesthesia',
		anesthetic : 'anaesthetic',
		anesthetics : 'anaesthetics',
		anesthetize : 'anaesthetise',
		anesthetized : 'anaesthetised',
		anesthetizes : 'anaesthetises',
		anesthetizing : 'anaesthetising',
		anesthetist : 'anaesthetist',
		anesthetists : 'anaesthetists',
		anesthetize : 'anaesthetize',
		anesthetized : 'anaesthetized',
		anesthetizes : 'anaesthetizes',
		anesthetizing : 'anaesthetizing',
		analog : 'analogue',
		analogs : 'analogues',
		analyze : 'analyse',
		analyzed : 'analysed',
		analyzes : 'analyses',
		analyzing : 'analysing',
		anglicize : 'anglicise',
		anglicized : 'anglicised',
		anglicizes : 'anglicises',
		anglicizing : 'anglicising',
		annualized : 'annualised',
		antagonize : 'antagonise',
		antagonized : 'antagonised',
		antagonizes : 'antagonises',
		antagonizing : 'antagonising',
		apologize : 'apologise',
		apologized : 'apologised',
		apologizes : 'apologises',
		apologizing : 'apologising',
		appall : 'appal',
		appalls : 'appals',
		appetizer : 'appetiser',
		appetizers : 'appetisers',
		appetizing : 'appetising',
		appetizingly : 'appetisingly',
		arbor : 'arbour',
		arbors : 'arbours',
		archeological : 'archaeological',
		archeologically : 'archaeologically',
		archeologist : 'archaeologist',
		archeologists : 'archaeologists',
		archeology : 'archaeology',
		ardor : 'ardour',
		armor : 'armour',
		armored : 'armoured',
		armorer : 'armourer',
		armorers : 'armourers',
		armories : 'armouries',
		armory : 'armoury',
		artifact : 'artefact',
		artifacts : 'artefacts',
		authorize : 'authorise',
		authorized : 'authorised',
		authorizes : 'authorises',
		authorizing : 'authorising',
		ax : 'axe',
		backpedaled : 'backpedalled',
		backpedaling : 'backpedalling',
		banister : 'bannister',
		banisters : 'bannisters',
		baptize : 'baptise',
		baptized : 'baptised',
		baptizes : 'baptises',
		baptizing : 'baptising',
		bastardize : 'bastardise',
		bastardized : 'bastardised',
		bastardizes : 'bastardises',
		bastardizing : 'bastardising',
		battleax : 'battleaxe',
		balk : 'baulk',
		balked : 'baulked',
		balking : 'baulking',
		balks : 'baulks',
		bedeviled : 'bedevilled',
		bedeviling : 'bedevilling',
		behavior : 'behaviour',
		behavioral : 'behavioural',
		behaviorism : 'behaviourism',
		behaviorist : 'behaviourist',
		behaviorists : 'behaviourists',
		behaviors : 'behaviours',
		behoove : 'behove',
		behooved : 'behoved',
		behooves : 'behoves',
		bejeweled : 'bejewelled',
		belabor : 'belabour',
		belabored : 'belaboured',
		belaboring : 'belabouring',
		belabors : 'belabours',
		beveled : 'bevelled',
		bevies : 'bevvies',
		bevy : 'bevvy',
		biased : 'biassed',
		biasing : 'biassing',
		binging : 'bingeing',
		bougainvillea : 'bougainvillaea',
		bougainvilleas : 'bougainvillaeas',
		bowdlerize : 'bowdlerise',
		bowdlerized : 'bowdlerised',
		bowdlerizes : 'bowdlerises',
		bowdlerizing : 'bowdlerising',
		breathalyze : 'breathalyse',
		breathalyzed : 'breathalysed',
		breathalyzer : 'breathalyser',
		breathalyzers : 'breathalysers',
		breathalyzes : 'breathalyses',
		breathalyzing : 'breathalysing',
		brutalize : 'brutalise',
		brutalized : 'brutalised',
		brutalizes : 'brutalises',
		brutalizing : 'brutalising',
		busses : 'buses',
		bussing : 'busing',
		cesarean : 'caesarean',
		cesareans : 'caesareans',
		caliber : 'calibre',
		calibers : 'calibres',
		caliper : 'calliper',
		calipers : 'callipers',
		calisthenics : 'callisthenics',
		canalize : 'canalise',
		canalized : 'canalised',
		canalizes : 'canalises',
		canalizing : 'canalising',
		cancelation : 'cancellation',
		cancelations : 'cancellations',
		canceled : 'cancelled',
		canceling : 'cancelling',
		candor : 'candour',
		cannibalize : 'cannibalise',
		cannibalized : 'cannibalised',
		cannibalizes : 'cannibalises',
		cannibalizing : 'cannibalising',
		canonize : 'canonise',
		canonized : 'canonised',
		canonizes : 'canonises',
		canonizing : 'canonising',
		capitalize : 'capitalise',
		capitalized : 'capitalised',
		capitalizes : 'capitalises',
		capitalizing : 'capitalising',
		caramelize : 'caramelise',
		caramelized : 'caramelised',
		caramelizes : 'caramelises',
		caramelizing : 'caramelising',
		carbonize : 'carbonise',
		carbonized : 'carbonised',
		carbonizes : 'carbonises',
		carbonizing : 'carbonising',
		caroled : 'carolled',
		caroling : 'carolling',
		catalog : 'catalogue',
		cataloged : 'catalogued',
		catalogs : 'catalogues',
		cataloging : 'cataloguing',
		catalyze : 'catalyse',
		catalyzed : 'catalysed',
		catalyzes : 'catalyses',
		catalyzing : 'catalysing',
		categorize : 'categorise',
		categorized : 'categorised',
		categorizes : 'categorises',
		categorizing : 'categorising',
		cauterize : 'cauterise',
		cauterized : 'cauterised',
		cauterizes : 'cauterises',
		cauterizing : 'cauterising',
		caviled : 'cavilled',
		caviling : 'cavilling',
		centigram : 'centigramme',
		centigrams : 'centigrammes',
		centiliter : 'centilitre',
		centiliters : 'centilitres',
		centimeter : 'centimetre',
		centimeters : 'centimetres',
		centralize : 'centralise',
		centralized : 'centralised',
		centralizes : 'centralises',
		centralizing : 'centralising',
		center : 'centre',
		centered : 'centred',
		centerfold : 'centrefold',
		centerfolds : 'centrefolds',
		centerpiece : 'centrepiece',
		centerpieces : 'centrepieces',
		centers : 'centres',
		channeled : 'channelled',
		channeling : 'channelling',
		characterize : 'characterise',
		characterized : 'characterised',
		characterizes : 'characterises',
		characterizing : 'characterising',
		check : 'cheque',
		checkbook : 'chequebook',
		checkbooks : 'chequebooks',
		checkered : 'chequered',
		checks : 'cheques',
		chili : 'chilli',
		chimera : 'chimaera',
		chimeras : 'chimaeras',
		chiseled : 'chiselled',
		chiseling : 'chiselling',
		circularize : 'circularise',
		circularized : 'circularised',
		circularizes : 'circularises',
		circularizing : 'circularising',
		civilize : 'civilise',
		civilized : 'civilised',
		civilizes : 'civilises',
		civilizing : 'civilising',
		clamor : 'clamour',
		clamored : 'clamoured',
		clamoring : 'clamouring',
		clamors : 'clamours',
		clangor : 'clangour',
		clarinetist : 'clarinettist',
		clarinetists : 'clarinettists',
		collectivize : 'collectivise',
		collectivized : 'collectivised',
		collectivizes : 'collectivises',
		collectivizing : 'collectivising',
		colonization : 'colonisation',
		colonize : 'colonise',
		colonized : 'colonised',
		colonizer : 'coloniser',
		colonizers : 'colonisers',
		colonizes : 'colonises',
		colonizing : 'colonising',
		color : 'colour',
		colorant : 'colourant',
		colorants : 'colourants',
		colored : 'coloured',
		coloreds : 'coloureds',
		colorful : 'colourful',
		colorfully : 'colourfully',
		coloring : 'colouring',
		colorize : 'colourize',
		colorized : 'colourized',
		colorizes : 'colourizes',
		colorizing : 'colourizing',
		colorless : 'colourless',
		colors : 'colours',
		commercialize : 'commercialise',
		commercialized : 'commercialised',
		commercializes : 'commercialises',
		commercializing : 'commercialising',
		compartmentalize : 'compartmentalise',
		compartmentalized : 'compartmentalised',
		compartmentalizes : 'compartmentalises',
		compartmentalizing : 'compartmentalising',
		computerize : 'computerise',
		computerized : 'computerised',
		computerizes : 'computerises',
		computerizing : 'computerising',
		conceptualize : 'conceptualise',
		conceptualized : 'conceptualised',
		conceptualizes : 'conceptualises',
		conceptualizing : 'conceptualising',
		connection : 'connexion',
		connections : 'connexions',
		contextualize : 'contextualise',
		contextualized : 'contextualised',
		contextualizes : 'contextualises',
		contextualizing : 'contextualising',
		cozier : 'cosier',
		cozies : 'cosies',
		coziest : 'cosiest',
		cozily : 'cosily',
		coziness : 'cosiness',
		cozy : 'cosy',
		councilor : 'councillor',
		councilors : 'councillors',
		counseled : 'counselled',
		counseling : 'counselling',
		counselor : 'counsellor',
		counselors : 'counsellors',
		crenelated : 'crenellated',
		criminalize : 'criminalise',
		criminalized : 'criminalised',
		criminalizes : 'criminalises',
		criminalizing : 'criminalising',
		criticize : 'criticise',
		criticized : 'criticised',
		criticizes : 'criticises',
		criticizing : 'criticising',
		crueler : 'crueller',
		cruelest : 'cruellest',
		crystallization : 'crystallisation',
		crystallize : 'crystallise',
		crystallized : 'crystallised',
		crystallizes : 'crystallises',
		crystallizing : 'crystallising',
		cudgeled : 'cudgelled',
		cudgeling : 'cudgelling',
		customize : 'customise',
		customized : 'customised',
		customizes : 'customises',
		customizing : 'customising',
		cipher : 'cypher',
		ciphers : 'cyphers',
		decentralization : 'decentralisation',
		decentralize : 'decentralise',
		decentralized : 'decentralised',
		decentralizes : 'decentralises',
		decentralizing : 'decentralising',
		decriminalization : 'decriminalisation',
		decriminalize : 'decriminalise',
		decriminalized : 'decriminalised',
		decriminalizes : 'decriminalises',
		decriminalizing : 'decriminalising',
		defense : 'defence',
		defenseless : 'defenceless',
		defenses : 'defences',
		dehumanization : 'dehumanisation',
		dehumanize : 'dehumanise',
		dehumanized : 'dehumanised',
		dehumanizes : 'dehumanises',
		dehumanizing : 'dehumanising',
		demeanor : 'demeanour',
		demilitarization : 'demilitarisation',
		demilitarize : 'demilitarise',
		demilitarized : 'demilitarised',
		demilitarizes : 'demilitarises',
		demilitarizing : 'demilitarising',
		demobilization : 'demobilisation',
		demobilize : 'demobilise',
		demobilized : 'demobilised',
		demobilizes : 'demobilises',
		demobilizing : 'demobilising',
		democratization : 'democratisation',
		democratize : 'democratise',
		democratized : 'democratised',
		democratizes : 'democratises',
		democratizing : 'democratising',
		demonize : 'demonise',
		demonized : 'demonised',
		demonizes : 'demonises',
		demonizing : 'demonising',
		demoralization : 'demoralisation',
		demoralize : 'demoralise',
		demoralized : 'demoralised',
		demoralizes : 'demoralises',
		demoralizing : 'demoralising',
		denationalization : 'denationalisation',
		denationalize : 'denationalise',
		denationalized : 'denationalised',
		denationalizes : 'denationalises',
		denationalizing : 'denationalising',
		deodorize : 'deodorise',
		deodorized : 'deodorised',
		deodorizes : 'deodorises',
		deodorizing : 'deodorising',
		depersonalize : 'depersonalise',
		depersonalized : 'depersonalised',
		depersonalizes : 'depersonalises',
		depersonalizing : 'depersonalising',
		deputize : 'deputise',
		deputized : 'deputised',
		deputizes : 'deputises',
		deputizing : 'deputising',
		desensitization : 'desensitisation',
		desensitize : 'desensitise',
		desensitized : 'desensitised',
		desensitizes : 'desensitises',
		desensitizing : 'desensitising',
		destabilization : 'destabilisation',
		destabilize : 'destabilise',
		destabilized : 'destabilised',
		destabilizes : 'destabilises',
		destabilizing : 'destabilising',
		dialed : 'dialled',
		dialing : 'dialling',
		dialog : 'dialogue',
		dialogs : 'dialogues',
		diarrhea : 'diarrhoea',
		digitize : 'digitise',
		digitized : 'digitised',
		digitizes : 'digitises',
		digitizing : 'digitising',
		disk : 'disc',
		discolor : 'discolour',
		discolored : 'discoloured',
		discoloring : 'discolouring',
		discolors : 'discolours',
		disks : 'discs',
		disemboweled : 'disembowelled',
		disemboweling : 'disembowelling',
		disfavor : 'disfavour',
		disheveled : 'dishevelled',
		dishonor : 'dishonour',
		dishonorable : 'dishonourable',
		dishonorably : 'dishonourably',
		dishonored : 'dishonoured',
		dishonoring : 'dishonouring',
		dishonors : 'dishonours',
		disorganization : 'disorganisation',
		disorganized : 'disorganised',
		distill : 'distil',
		distills : 'distils',
		dramatization : 'dramatisation',
		dramatizations : 'dramatisations',
		dramatize : 'dramatise',
		dramatized : 'dramatised',
		dramatizes : 'dramatises',
		dramatizing : 'dramatising',
		draft : 'draught',
		draftboard : 'draughtboard',
		draftboards : 'draughtboards',
		draftier : 'draughtier',
		draftiest : 'draughtiest',
		drafts : 'draughts',
		draftsman : 'draughtsman',
		draftsmanship : 'draughtsmanship',
		draftsmen : 'draughtsmen',
		draftswoman : 'draughtswoman',
		draftswomen : 'draughtswomen',
		drafty : 'draughty',
		driveled : 'drivelled',
		driveling : 'drivelling',
		dueled : 'duelled',
		dueling : 'duelling',
		economize : 'economise',
		economized : 'economised',
		economizes : 'economises',
		economizing : 'economising',
		edema  : 'edoema',
		editorialize : 'editorialise',
		editorialized : 'editorialised',
		editorializes : 'editorialises',
		editorializing : 'editorialising',
		empathize : 'empathise',
		empathized : 'empathised',
		empathizes : 'empathises',
		empathizing : 'empathising',
		emphasize : 'emphasise',
		emphasized : 'emphasised',
		emphasizes : 'emphasises',
		emphasizing : 'emphasising',
		enameled : 'enamelled',
		enameling : 'enamelling',
		enamored : 'enamoured',
		encyclopedia : 'encyclopaedia',
		encyclopedias : 'encyclopaedias',
		encyclopedic : 'encyclopaedic',
		endeavor : 'endeavour',
		endeavored : 'endeavoured',
		endeavoring : 'endeavouring',
		endeavors : 'endeavours',
		energize : 'energise',
		energized : 'energised',
		energizes : 'energises',
		energizing : 'energising',
		enroll : 'enrol',
		enrolls : 'enrols',
		enthrall : 'enthral',
		enthralls : 'enthrals',
		epaulet : 'epaulette',
		epaulets : 'epaulettes',
		epicenter : 'epicentre',
		epicenters : 'epicentres',
		epilog : 'epilogue',
		epilogs : 'epilogues',
		epitomize : 'epitomise',
		epitomized : 'epitomised',
		epitomizes : 'epitomises',
		epitomizing : 'epitomising',
		equalization : 'equalisation',
		equalize : 'equalise',
		equalized : 'equalised',
		equalizer : 'equaliser',
		equalizers : 'equalisers',
		equalizes : 'equalises',
		equalizing : 'equalising',
		eulogize : 'eulogise',
		eulogized : 'eulogised',
		eulogizes : 'eulogises',
		eulogizing : 'eulogising',
		evangelize : 'evangelise',
		evangelized : 'evangelised',
		evangelizes : 'evangelises',
		evangelizing : 'evangelising',
		exorcize : 'exorcise',
		exorcized : 'exorcised',
		exorcizes : 'exorcises',
		exorcizing : 'exorcising',
		extemporization : 'extemporisation',
		extemporize : 'extemporise',
		extemporized : 'extemporised',
		extemporizes : 'extemporises',
		extemporizing : 'extemporising',
		externalization : 'externalisation',
		externalizations : 'externalisations',
		externalize : 'externalise',
		externalized : 'externalised',
		externalizes : 'externalises',
		externalizing : 'externalising',
		factorize : 'factorise',
		factorized : 'factorised',
		factorizes : 'factorises',
		factorizing : 'factorising',
		fecal : 'faecal',
		feces : 'faeces',
		familiarization : 'familiarisation',
		familiarize : 'familiarise',
		familiarized : 'familiarised',
		familiarizes : 'familiarises',
		familiarizing : 'familiarising',
		fantasize : 'fantasise',
		fantasized : 'fantasised',
		fantasizes : 'fantasises',
		fantasizing : 'fantasising',
		favor : 'favour',
		favorable : 'favourable',
		favorably : 'favourably',
		favored : 'favoured',
		favoring : 'favouring',
		favorite : 'favourite',
		favorites : 'favourites',
		favoritism : 'favouritism',
		favors : 'favours',
		feminize : 'feminise',
		feminized : 'feminised',
		feminizes : 'feminises',
		feminizing : 'feminising',
		fertilization : 'fertilisation',
		fertilize : 'fertilise',
		fertilized : 'fertilised',
		fertilizer : 'fertiliser',
		fertilizers : 'fertilisers',
		fertilizes : 'fertilises',
		fertilizing : 'fertilising',
		fervor : 'fervour',
		fiber : 'fibre',
		fiberglass : 'fibreglass',
		fibers : 'fibres',
		fictionalization : 'fictionalisation',
		fictionalizations : 'fictionalisations',
		fictionalize : 'fictionalise',
		fictionalized : 'fictionalised',
		fictionalizes : 'fictionalises',
		fictionalizing : 'fictionalising',
		filet : 'fillet',
		fileted  : 'filleted ',
		fileting : 'filleting',
		filets  : 'fillets ',
		finalization : 'finalisation',
		finalize : 'finalise',
		finalized : 'finalised',
		finalizes : 'finalises',
		finalizing : 'finalising',
		flutist : 'flautist',
		flutists : 'flautists',
		flavor : 'flavour',
		flavored : 'flavoured',
		flavoring : 'flavouring',
		flavorings : 'flavourings',
		flavorless : 'flavourless',
		flavors : 'flavours',
		flavorsome : 'flavoursome',
		flier: 'flyer',
		flyer: 'flier',
		fetal : 'foetal',
		fetid : 'foetid',
		fetus : 'foetus',
		fetuses : 'foetuses',
		formalization : 'formalisation',
		formalize : 'formalise',
		formalized : 'formalised',
		formalizes : 'formalises',
		formalizing : 'formalising',
		fossilization : 'fossilisation',
		fossilize : 'fossilise',
		fossilized : 'fossilised',
		fossilizes : 'fossilises',
		fossilizing : 'fossilising',
		fraternization : 'fraternisation',
		fraternize : 'fraternise',
		fraternized : 'fraternised',
		fraternizes : 'fraternises',
		fraternizing : 'fraternising',
		fulfill : 'fulfil',
		fulfillment : 'fulfilment',
		fulfills : 'fulfils',
		funneled : 'funnelled',
		funneling : 'funnelling',
		galvanize : 'galvanise',
		galvanized : 'galvanised',
		galvanizes : 'galvanises',
		galvanizing : 'galvanising',
		gamboled : 'gambolled',
		gamboling : 'gambolling',
		jail : 'gaol',
		jailbird : 'gaolbird',
		jailbirds : 'gaolbirds',
		jailbreak : 'gaolbreak',
		jailbreaks : 'gaolbreaks',
		jailed : 'gaoled',
		jailer : 'gaoler',
		jailers : 'gaolers',
		jailing : 'gaoling',
		jails : 'gaols',
		gasses : 'gases',
		gage : 'gauge',
		gaged : 'gauged',
		gages : 'gauges',
		gaging : 'gauging',
		generalization : 'generalisation',
		generalizations : 'generalisations',
		generalize : 'generalise',
		generalized : 'generalised',
		generalizes : 'generalises',
		generalizing : 'generalising',
		ghettoize : 'ghettoise',
		ghettoized : 'ghettoised',
		ghettoizes : 'ghettoises',
		ghettoizing : 'ghettoising',
		gypsies : 'gipsies',
		glamorize : 'glamorise',
		glamorized : 'glamorised',
		glamorizes : 'glamorises',
		glamorizing : 'glamorising',
		glamor : 'glamour',
		globalization : 'globalisation',
		globalize : 'globalise',
		globalized : 'globalised',
		globalizes : 'globalises',
		globalizing : 'globalising',
		gluing  : 'glueing ',
		goiter : 'goitre',
		goiters : 'goitres',
		gonorrhea : 'gonorrhoea',
		gram : 'gramme',
		grams : 'grammes',
		graveled : 'gravelled',
		gray : 'grey',
		grayed : 'greyed',
		graying : 'greying',
		grayish : 'greyish',
		grayness : 'greyness',
		grays : 'greys',
		groveled : 'grovelled',
		groveling : 'grovelling',
		groin : 'groyne',
		groins : 'groynes ',
		grueling : 'gruelling',
		gruelingly : 'gruellingly',
		griffin : 'gryphon',
		griffins : 'gryphons',
		gynecological : 'gynaecological',
		gynecologist : 'gynaecologist',
		gynecologists : 'gynaecologists',
		gynecology : 'gynaecology',
		hematological : 'haematological',
		hematologist : 'haematologist',
		hematologists : 'haematologists',
		hematology : 'haematology',
		hemoglobin : 'haemoglobin',
		hemophilia : 'haemophilia',
		hemophiliac : 'haemophiliac',
		hemophiliacs : 'haemophiliacs',
		hemorrhage : 'haemorrhage',
		hemorrhaged : 'haemorrhaged',
		hemorrhages : 'haemorrhages',
		hemorrhaging : 'haemorrhaging',
		hemorrhoids : 'haemorrhoids',
		harbor : 'harbour',
		harbored : 'harboured',
		harboring : 'harbouring',
		harbors : 'harbours',
		harmonization : 'harmonisation',
		harmonize : 'harmonise',
		harmonized : 'harmonised',
		harmonizes : 'harmonises',
		harmonizing : 'harmonising',
		homeopath : 'homoeopath',
		homeopathic : 'homoeopathic',
		homeopaths : 'homoeopaths',
		homeopathy : 'homoeopathy',
		homogenize : 'homogenise',
		homogenized : 'homogenised',
		homogenizes : 'homogenises',
		homogenizing : 'homogenising',
		honor : 'honour',
		honorable : 'honourable',
		honorably : 'honourably',
		honored : 'honoured',
		honoring : 'honouring',
		honors : 'honours',
		hospitalization : 'hospitalisation',
		hospitalize : 'hospitalise',
		hospitalized : 'hospitalised',
		hospitalizes : 'hospitalises',
		hospitalizing : 'hospitalising',
		humanize : 'humanise',
		humanized : 'humanised',
		humanizes : 'humanises',
		humanizing : 'humanising',
		humor : 'humour',
		humored : 'humoured',
		humoring : 'humouring',
		humorless : 'humourless',
		humors : 'humours',
		hybridize : 'hybridise',
		hybridized : 'hybridised',
		hybridizes : 'hybridises',
		hybridizing : 'hybridising',
		hypnotize : 'hypnotise',
		hypnotized : 'hypnotised',
		hypnotizes : 'hypnotises',
		hypnotizing : 'hypnotising',
		hypothesize : 'hypothesise',
		hypothesized : 'hypothesised',
		hypothesizes : 'hypothesises',
		hypothesizing : 'hypothesising',
		idealization : 'idealisation',
		idealize : 'idealise',
		idealized : 'idealised',
		idealizes : 'idealises',
		idealizing : 'idealising',
		idolize : 'idolise',
		idolized : 'idolised',
		idolizes : 'idolises',
		idolizing : 'idolising',
		immobilization : 'immobilisation',
		immobilize : 'immobilise',
		immobilized : 'immobilised',
		immobilizer : 'immobiliser',
		immobilizers : 'immobilisers',
		immobilizes : 'immobilises',
		immobilizing : 'immobilising',
		immortalize : 'immortalise',
		immortalized : 'immortalised',
		immortalizes : 'immortalises',
		immortalizing : 'immortalising',
		immunization : 'immunisation',
		immunize : 'immunise',
		immunized : 'immunised',
		immunizes : 'immunises',
		immunizing : 'immunising',
		impaneled : 'impanelled',
		impaneling : 'impanelling',
		imperiled : 'imperilled',
		imperiling : 'imperilling',
		individualize : 'individualise',
		individualized : 'individualised',
		individualizes : 'individualises',
		individualizing : 'individualising',
		industrialize : 'industrialise',
		industrialized : 'industrialised',
		industrializes : 'industrialises',
		industrializing : 'industrialising',
		inflection : 'inflexion',
		inflections : 'inflexions',
		initialize : 'initialise',
		initialized : 'initialised',
		initializes : 'initialises',
		initializing : 'initialising',
		initialed : 'initialled',
		initialing : 'initialling',
		install : 'instal',
		installment : 'instalment',
		installments : 'instalments',
		installs : 'instals',
		instill : 'instil',
		instills : 'instils',
		institutionalization : 'institutionalisation',
		institutionalize : 'institutionalise',
		institutionalized : 'institutionalised',
		institutionalizes : 'institutionalises',
		institutionalizing : 'institutionalising',
		intellectualize : 'intellectualise',
		intellectualized : 'intellectualised',
		intellectualizes : 'intellectualises',
		intellectualizing : 'intellectualising',
		internalization : 'internalisation',
		internalize : 'internalise',
		internalized : 'internalised',
		internalizes : 'internalises',
		internalizing : 'internalising',
		internationalization : 'internationalisation',
		internationalize : 'internationalise',
		internationalized : 'internationalised',
		internationalizes : 'internationalises',
		internationalizing : 'internationalising',
		ionization : 'ionisation',
		ionize : 'ionise',
		ionized : 'ionised',
		ionizer : 'ioniser',
		ionizers : 'ionisers',
		ionizes : 'ionises',
		ionizing : 'ionising',
		italicize : 'italicise',
		italicized : 'italicised',
		italicizes : 'italicises',
		italicizing : 'italicising',
		itemize : 'itemise',
		itemized : 'itemised',
		itemizes : 'itemises',
		itemizing : 'itemising',
		jeopardize : 'jeopardise',
		jeopardized : 'jeopardised',
		jeopardizes : 'jeopardises',
		jeopardizing : 'jeopardising',
		jeweled : 'jewelled',
		jeweler : 'jeweller',
		jewelers : 'jewellers',
		jewelry : 'jewellery',
		judgment : 'judgement ',
		kilogram : 'kilogramme',
		kilograms : 'kilogrammes',
		kilometer : 'kilometre',
		kilometers : 'kilometres',
		labeled : 'labelled',
		labeling : 'labelling',
		labor : 'labour',
		labored : 'laboured',
		laborer : 'labourer',
		laborers : 'labourers',
		laboring : 'labouring',
		labors : 'labours',
		lackluster : 'lacklustre',
		legalization : 'legalisation',
		legalize : 'legalise',
		legalized : 'legalised',
		legalizes : 'legalises',
		legalizing : 'legalising',
		legitimize : 'legitimise',
		legitimized : 'legitimised',
		legitimizes : 'legitimises',
		legitimizing : 'legitimising',
		leukemia : 'leukaemia',
		leveled : 'levelled',
		leveler : 'leveller',
		levelers : 'levellers',
		leveling : 'levelling',
		libeled : 'libelled',
		libeling : 'libelling',
		libelous : 'libellous',
		liberalization : 'liberalisation',
		liberalize : 'liberalise',
		liberalized : 'liberalised',
		liberalizes : 'liberalises',
		liberalizing : 'liberalising',
		license : 'licence',
		licensed : 'licenced',
		licenses : 'licences',
		licensing : 'licencing',
		likable  : 'likeable',
		lionization : 'lionisation',
		lionize : 'lionise',
		lionized : 'lionised',
		lionizes : 'lionises',
		lionizing : 'lionising',
		liquidize : 'liquidise',
		liquidized : 'liquidised',
		liquidizer : 'liquidiser',
		liquidizers : 'liquidisers',
		liquidizes : 'liquidises',
		liquidizing : 'liquidising',
		liter : 'litre',
		liters : 'litres',
		localize : 'localise',
		localized : 'localised',
		localizes : 'localises',
		localizing : 'localising',
		louver : 'louvre',
		louvered : 'louvred',
		louvers  : 'louvres',
		luster : 'lustre',
		magnetize : 'magnetise',
		magnetized : 'magnetised',
		magnetizes : 'magnetises',
		magnetizing : 'magnetising',
		maneuverability : 'manoeuvrability',
		maneuverable : 'manoeuvrable',
		maneuver : 'manoeuvre',
		maneuvered : 'manoeuvred',
		maneuvers : 'manoeuvres',
		maneuvering : 'manoeuvring',
		maneuverings : 'manoeuvrings',
		marginalization : 'marginalisation',
		marginalize : 'marginalise',
		marginalized : 'marginalised',
		marginalizes : 'marginalises',
		marginalizing : 'marginalising',
		marshaled : 'marshalled',
		marshaling : 'marshalling',
		marveled : 'marvelled',
		marveling : 'marvelling',
		marvelous : 'marvellous',
		marvelously : 'marvellously',
		materialization : 'materialisation',
		materialize : 'materialise',
		materialized : 'materialised',
		materializes : 'materialises',
		materializing : 'materialising',
		maximization : 'maximisation',
		maximize : 'maximise',
		maximized : 'maximised',
		maximizes : 'maximises',
		maximizing : 'maximising',
		meager : 'meagre',
		mechanization : 'mechanisation',
		mechanize : 'mechanise',
		mechanized : 'mechanised',
		mechanizes : 'mechanises',
		mechanizing : 'mechanising',
		medieval : 'mediaeval',
		memorialize : 'memorialise',
		memorialized : 'memorialised',
		memorializes : 'memorialises',
		memorializing : 'memorialising',
		memorize : 'memorise',
		memorized : 'memorised',
		memorizes : 'memorises',
		memorizing : 'memorising',
		mesmerize : 'mesmerise',
		mesmerized : 'mesmerised',
		mesmerizes : 'mesmerises',
		mesmerizing : 'mesmerising',
		metabolize : 'metabolise',
		metabolized : 'metabolised',
		metabolizes : 'metabolises',
		metabolizing : 'metabolising',
		meter : 'metre',
		meters : 'metres',
		micrometer : 'micrometre',
		micrometers : 'micrometres',
		militarize : 'militarise',
		militarized : 'militarised',
		militarizes : 'militarises',
		militarizing : 'militarising',
		milligram : 'milligramme',
		milligrams : 'milligrammes',
		milliliter : 'millilitre',
		milliliters : 'millilitres',
		millimeter : 'millimetre',
		millimeters : 'millimetres',
		miniaturization : 'miniaturisation',
		miniaturize : 'miniaturise',
		miniaturized : 'miniaturised',
		miniaturizes : 'miniaturises',
		miniaturizing : 'miniaturising',
		minibusses  : 'minibuses',
		minimize : 'minimise',
		minimized : 'minimised',
		minimizes : 'minimises',
		minimizing : 'minimising',
		misbehavior : 'misbehaviour',
		misdemeanor : 'misdemeanour',
		misdemeanors : 'misdemeanours',
		misspelled  : 'misspelt',
		miter : 'mitre',
		miters : 'mitres',
		mobilization : 'mobilisation',
		mobilize : 'mobilise',
		mobilized : 'mobilised',
		mobilizes : 'mobilises',
		mobilizing : 'mobilising',
		modeled : 'modelled',
		modeler : 'modeller',
		modelers : 'modellers',
		modeling : 'modelling',
		modernize : 'modernise',
		modernized : 'modernised',
		modernizes : 'modernises',
		modernizing : 'modernising',
		moisturize : 'moisturise',
		moisturized : 'moisturised',
		moisturizer : 'moisturiser',
		moisturizers : 'moisturisers',
		moisturizes : 'moisturises',
		moisturizing : 'moisturising',
		monolog : 'monologue',
		monologs : 'monologues',
		monopolization : 'monopolisation',
		monopolize : 'monopolise',
		monopolized : 'monopolised',
		monopolizes : 'monopolises',
		monopolizing : 'monopolising',
		moralize : 'moralise',
		moralized : 'moralised',
		moralizes : 'moralises',
		moralizing : 'moralising',
		motorized : 'motorised',
		mold : 'mould',
		molded : 'moulded',
		molder : 'moulder',
		moldered : 'mouldered',
		moldering : 'mouldering',
		molders : 'moulders',
		moldier : 'mouldier',
		moldiest : 'mouldiest',
		molding : 'moulding',
		moldings : 'mouldings',
		molds : 'moulds',
		moldy : 'mouldy',
		molt : 'moult',
		molted : 'moulted',
		molting : 'moulting',
		molts : 'moults',
		mustache : 'moustache',
		mustached : 'moustached',
		mustaches : 'moustaches',
		mustachioed : 'moustachioed',
		multicolored : 'multicoloured',
		nationalization : 'nationalisation',
		nationalizations : 'nationalisations',
		nationalize : 'nationalise',
		nationalized : 'nationalised',
		nationalizes : 'nationalises',
		nationalizing : 'nationalising',
		naturalization : 'naturalisation',
		naturalize : 'naturalise',
		naturalized : 'naturalised',
		naturalizes : 'naturalises',
		naturalizing : 'naturalising',
		neighbor : 'neighbour',
		neighborhood : 'neighbourhood',
		neighborhoods : 'neighbourhoods',
		neighboring : 'neighbouring',
		neighborliness : 'neighbourliness',
		neighborly : 'neighbourly',
		neighbors : 'neighbours',
		neutralization : 'neutralisation',
		neutralize : 'neutralise',
		neutralized : 'neutralised',
		neutralizes : 'neutralises',
		neutralizing : 'neutralising',
		normalization : 'normalisation',
		normalize : 'normalise',
		normalized : 'normalised',
		normalizes : 'normalises',
		normalizing : 'normalising',
		odor : 'odour',
		odorless : 'odourless',
		odors : 'odours',
		esophagus : 'oesophagus',
		esophaguses : 'oesophaguses',
		estrogen : 'oestrogen',
		offense : 'offence',
		offenses : 'offences',
		omelet : 'omelette',
		omelets : 'omelettes',
		optimize : 'optimise',
		optimized : 'optimised',
		optimizes : 'optimises',
		optimizing : 'optimising',
		organization : 'organisation',
		organizational : 'organisational',
		organizations : 'organisations',
		organize : 'organise',
		organized : 'organised',
		organizer : 'organiser',
		organizers : 'organisers',
		organizes : 'organises',
		organizing : 'organising',
		orthopedic : 'orthopaedic',
		orthopedics : 'orthopaedics',
		ostracize : 'ostracise',
		ostracized : 'ostracised',
		ostracizes : 'ostracises',
		ostracizing : 'ostracising',
		outmaneuver : 'outmanoeuvre',
		outmaneuvered : 'outmanoeuvred',
		outmaneuvers : 'outmanoeuvres',
		outmaneuvering : 'outmanoeuvring',
		overemphasize : 'overemphasise',
		overemphasized : 'overemphasised',
		overemphasizes : 'overemphasises',
		overemphasizing : 'overemphasising',
		oxidization : 'oxidisation',
		oxidize : 'oxidise',
		oxidized : 'oxidised',
		oxidizes : 'oxidises',
		oxidizing : 'oxidising',
		pederast : 'paederast',
		pederasts : 'paederasts',
		pediatric : 'paediatric',
		pediatrician : 'paediatrician',
		pediatricians : 'paediatricians',
		pediatrics : 'paediatrics',
		pedophile : 'paedophile',
		pedophiles : 'paedophiles',
		pedophilia : 'paedophilia',
		paleolithic : 'palaeolithic',
		paleontologist : 'palaeontologist',
		paleontologists : 'palaeontologists',
		paleontology : 'palaeontology',
		paneled : 'panelled',
		paneling : 'panelling',
		panelist : 'panellist',
		panelists : 'panellists',
		paralyze : 'paralyse',
		paralyzed : 'paralysed',
		paralyzes : 'paralyses',
		paralyzing : 'paralysing',
		parceled : 'parcelled',
		parceling : 'parcelling',
		parlor : 'parlour',
		parlors : 'parlours',
		particularize : 'particularise',
		particularized : 'particularised',
		particularizes : 'particularises',
		particularizing : 'particularising',
		passivization : 'passivisation',
		passivize : 'passivise',
		passivized : 'passivised',
		passivizes : 'passivises',
		passivizing : 'passivising',
		pasteurization : 'pasteurisation',
		pasteurize : 'pasteurise',
		pasteurized : 'pasteurised',
		pasteurizes : 'pasteurises',
		pasteurizing : 'pasteurising',
		patronize : 'patronise',
		patronized : 'patronised',
		patronizes : 'patronises',
		patronizing : 'patronising',
		patronizingly : 'patronisingly',
		pedaled : 'pedalled',
		pedaling : 'pedalling',
		pedestrianization : 'pedestrianisation',
		pedestrianize : 'pedestrianise',
		pedestrianized : 'pedestrianised',
		pedestrianizes : 'pedestrianises',
		pedestrianizing : 'pedestrianising',
		penalize : 'penalise',
		penalized : 'penalised',
		penalizes : 'penalises',
		penalizing : 'penalising',
		penciled : 'pencilled',
		penciling : 'pencilling',
		personalize : 'personalise',
		personalized : 'personalised',
		personalizes : 'personalises',
		personalizing : 'personalising',
		pharmacopeia : 'pharmacopoeia',
		pharmacopeias : 'pharmacopoeias',
		philosophize : 'philosophise',
		philosophized : 'philosophised',
		philosophizes : 'philosophises',
		philosophizing : 'philosophising',
		filter : 'philtre',
		filters : 'philtres',
		phony  : 'phoney ',
		plagiarize : 'plagiarise',
		plagiarized : 'plagiarised',
		plagiarizes : 'plagiarises',
		plagiarizing : 'plagiarising',
		plow : 'plough',
		plowed : 'ploughed',
		plowing : 'ploughing',
		plowman : 'ploughman',
		plowmen : 'ploughmen',
		plows : 'ploughs',
		plowshare : 'ploughshare',
		plowshares : 'ploughshares',
		polarization : 'polarisation',
		polarize : 'polarise',
		polarized : 'polarised',
		polarizes : 'polarises',
		polarizing : 'polarising',
		politicization : 'politicisation',
		politicize : 'politicise',
		politicized : 'politicised',
		politicizes : 'politicises',
		politicizing : 'politicising',
		popularization : 'popularisation',
		popularize : 'popularise',
		popularized : 'popularised',
		popularizes : 'popularises',
		popularizing : 'popularising',
		pouf : 'pouffe',
		poufs : 'pouffes',
		practice : 'practise',
		practiced : 'practised',
		practices : 'practises',
		practicing  : 'practising ',
		presidium : 'praesidium',
		presidiums  : 'praesidiums ',
		pressurization : 'pressurisation',
		pressurize : 'pressurise',
		pressurized : 'pressurised',
		pressurizes : 'pressurises',
		pressurizing : 'pressurising',
		pretense : 'pretence',
		pretenses : 'pretences',
		primeval : 'primaeval',
		prioritization : 'prioritisation',
		prioritize : 'prioritise',
		prioritized : 'prioritised',
		prioritizes : 'prioritises',
		prioritizing : 'prioritising',
		privatization : 'privatisation',
		privatizations : 'privatisations',
		privatize : 'privatise',
		privatized : 'privatised',
		privatizes : 'privatises',
		privatizing : 'privatising',
		professionalization : 'professionalisation',
		professionalize : 'professionalise',
		professionalized : 'professionalised',
		professionalizes : 'professionalises',
		professionalizing : 'professionalising',
		program : 'programme',
		programs : 'programmes',
		prolog : 'prologue',
		prologs : 'prologues',
		propagandize : 'propagandise',
		propagandized : 'propagandised',
		propagandizes : 'propagandises',
		propagandizing : 'propagandising',
		proselytize : 'proselytise',
		proselytized : 'proselytised',
		proselytizer : 'proselytiser',
		proselytizers : 'proselytisers',
		proselytizes : 'proselytises',
		proselytizing : 'proselytising',
		psychoanalyze : 'psychoanalyse',
		psychoanalyzed : 'psychoanalysed',
		psychoanalyzes : 'psychoanalyses',
		psychoanalyzing : 'psychoanalysing',
		publicize : 'publicise',
		publicized : 'publicised',
		publicizes : 'publicises',
		publicizing : 'publicising',
		pulverization : 'pulverisation',
		pulverize : 'pulverise',
		pulverized : 'pulverised',
		pulverizes : 'pulverises',
		pulverizing : 'pulverising',
		pummel : 'pummelled',
		pummeled : 'pummelling',
		pajama : 'pyjama',
		pajamas : 'pyjamas',
		pizzazz : 'pzazz',
		quarreled : 'quarrelled',
		quarreling : 'quarrelling',
		radicalize : 'radicalise',
		radicalized : 'radicalised',
		radicalizes : 'radicalises',
		radicalizing : 'radicalising',
		rancor : 'rancour',
		randomize : 'randomise',
		randomized : 'randomised',
		randomizes : 'randomises',
		randomizing : 'randomising',
		rationalization : 'rationalisation',
		rationalizations : 'rationalisations',
		rationalize : 'rationalise',
		rationalized : 'rationalised',
		rationalizes : 'rationalises',
		rationalizing : 'rationalising',
		raveled : 'ravelled',
		raveling : 'ravelling',
		realizable : 'realisable',
		realization : 'realisation',
		realizations : 'realisations',
		realize : 'realise',
		realized : 'realised',
		realizes : 'realises',
		realizing : 'realising',
		recognizable : 'recognisable',
		recognizably : 'recognisably',
		recognizance : 'recognisance',
		recognize : 'recognise',
		recognized : 'recognised',
		recognizes : 'recognises',
		recognizing : 'recognising',
		reconnoiter : 'reconnoitre',
		reconnoitered : 'reconnoitred',
		reconnoiters : 'reconnoitres',
		reconnoitering : 'reconnoitring',
		refueled : 'refuelled',
		refueling : 'refuelling',
		regularization : 'regularisation',
		regularize : 'regularise',
		regularized : 'regularised',
		regularizes : 'regularises',
		regularizing : 'regularising',
		remodeled : 'remodelled',
		remodeling : 'remodelling',
		remold : 'remould',
		remolded : 'remoulded',
		remolding : 'remoulding',
		remolds : 'remoulds',
		reorganization : 'reorganisation',
		reorganizations : 'reorganisations',
		reorganize : 'reorganise',
		reorganized : 'reorganised',
		reorganizes : 'reorganises',
		reorganizing : 'reorganising',
		reveled : 'revelled',
		reveler : 'reveller',
		revelers : 'revellers',
		reveling : 'revelling',
		revitalize : 'revitalise',
		revitalized : 'revitalised',
		revitalizes : 'revitalises',
		revitalizing : 'revitalising',
		revolutionize : 'revolutionise',
		revolutionized : 'revolutionised',
		revolutionizes : 'revolutionises',
		revolutionizing : 'revolutionising',
		rhapsodize : 'rhapsodise',
		rhapsodized : 'rhapsodised',
		rhapsodizes : 'rhapsodises',
		rhapsodizing : 'rhapsodising',
		rigor : 'rigour',
		rigors : 'rigours',
		ritualized : 'ritualised',
		rivaled : 'rivalled',
		rivaling : 'rivalling',
		romanticize : 'romanticise',
		romanticized : 'romanticised',
		romanticizes : 'romanticises',
		romanticizing : 'romanticising',
		rumor : 'rumour',
		rumored : 'rumoured',
		rumors : 'rumours',
		saber : 'sabre',
		sabers : 'sabres',
		saltpeter : 'saltpetre',
		sanitize : 'sanitise',
		sanitized : 'sanitised',
		sanitizes : 'sanitises',
		sanitizing : 'sanitising',
		satirize : 'satirise',
		satirized : 'satirised',
		satirizes : 'satirises',
		satirizing : 'satirising',
		savior : 'saviour',
		saviors : 'saviours',
		savor : 'savour',
		savored : 'savoured',
		savories : 'savouries',
		savoring : 'savouring',
		savors : 'savours',
		savory : 'savoury',
		scandalize : 'scandalise',
		scandalized : 'scandalised',
		scandalizes : 'scandalises',
		scandalizing : 'scandalising',
		skeptic : 'sceptic',
		skeptical : 'sceptical',
		skeptically : 'sceptically',
		skepticism : 'scepticism',
		skeptics : 'sceptics',
		scepter : 'sceptre',
		scepters : 'sceptres',
		scrutinize : 'scrutinise',
		scrutinized : 'scrutinised',
		scrutinizes : 'scrutinises',
		scrutinizing : 'scrutinising',
		secularization : 'secularisation',
		secularize : 'secularise',
		secularized : 'secularised',
		secularizes : 'secularises',
		secularizing : 'secularising',
		sensationalize : 'sensationalise',
		sensationalized : 'sensationalised',
		sensationalizes : 'sensationalises',
		sensationalizing : 'sensationalising',
		sensitize : 'sensitise',
		sensitized : 'sensitised',
		sensitizes : 'sensitises',
		sensitizing : 'sensitising',
		sentimentalize : 'sentimentalise',
		sentimentalized : 'sentimentalised',
		sentimentalizes : 'sentimentalises',
		sentimentalizing : 'sentimentalising',
		sepulcher : 'sepulchre',
		sepulchers  : 'sepulchres',
		serialization : 'serialisation',
		serializations : 'serialisations',
		serialize : 'serialise',
		serialized : 'serialised',
		serializes : 'serialises',
		serializing : 'serialising',
		sermonize : 'sermonise',
		sermonized : 'sermonised',
		sermonizes : 'sermonises',
		sermonizing : 'sermonising',
		sheik  : 'sheikh ',
		shoveled : 'shovelled',
		shoveling : 'shovelling',
		shriveled : 'shrivelled',
		shriveling : 'shrivelling',
		signalize : 'signalise',
		signalized : 'signalised',
		signalizes : 'signalises',
		signalizing : 'signalising',
		signaled : 'signalled',
		signaling : 'signalling',
		smolder : 'smoulder',
		smoldered : 'smouldered',
		smoldering : 'smouldering',
		smolders : 'smoulders',
		sniveled : 'snivelled',
		sniveling : 'snivelling',
		snorkeled : 'snorkelled',
		snorkeling : 'snorkelling',
		snowplow : 'snowplough',
		snowplow : 'snowploughs',
		socialization : 'socialisation',
		socialize : 'socialise',
		socialized : 'socialised',
		socializes : 'socialises',
		socializing : 'socialising',
		sodomize : 'sodomise',
		sodomized : 'sodomised',
		sodomizes : 'sodomises',
		sodomizing : 'sodomising',
		solemnize : 'solemnise',
		solemnized : 'solemnised',
		solemnizes : 'solemnises',
		solemnizing : 'solemnising',
		somber : 'sombre',
		specialization : 'specialisation',
		specializations : 'specialisations',
		specialize : 'specialise',
		specialized : 'specialised',
		specializes : 'specialises',
		specializing : 'specialising',
		specter : 'spectre',
		specters : 'spectres',
		spiraled : 'spiralled',
		spiraling : 'spiralling',
		splendor : 'splendour',
		splendors : 'splendours',
		squirreled : 'squirrelled',
		squirreling : 'squirrelling',
		stabilization : 'stabilisation',
		stabilize : 'stabilise',
		stabilized : 'stabilised',
		stabilizer : 'stabiliser',
		stabilizers : 'stabilisers',
		stabilizes : 'stabilises',
		stabilizing : 'stabilising',
		standardization : 'standardisation',
		standardize : 'standardise',
		standardized : 'standardised',
		standardizes : 'standardises',
		standardizing : 'standardising',
		stenciled : 'stencilled',
		stenciling : 'stencilling',
		sterilization : 'sterilisation',
		sterilizations : 'sterilisations',
		sterilize : 'sterilise',
		sterilized : 'sterilised',
		sterilizer : 'steriliser',
		sterilizers : 'sterilisers',
		sterilizes : 'sterilises',
		sterilizing : 'sterilising',
		stigmatization : 'stigmatisation',
		stigmatize : 'stigmatise',
		stigmatized : 'stigmatised',
		stigmatizes : 'stigmatises',
		stigmatizing : 'stigmatising',
		story : 'storey',
		stories : 'storeys',
		subsidization : 'subsidisation',
		subsidize : 'subsidise',
		subsidized : 'subsidised',
		subsidizer : 'subsidiser',
		subsidizers : 'subsidisers',
		subsidizes : 'subsidises',
		subsidizing : 'subsidising',
		succor : 'succour',
		succored : 'succoured',
		succoring : 'succouring',
		succors : 'succours',
		sulfate : 'sulphate',
		sulfates : 'sulphates',
		sulfide : 'sulphide',
		sulfides : 'sulphides',
		sulfur : 'sulphur',
		sulfurous : 'sulphurous',
		summarize : 'summarise',
		summarized : 'summarised',
		summarizes : 'summarises',
		summarizing : 'summarising',
		swiveled : 'swivelled',
		swiveling : 'swivelling',
		symbolize : 'symbolise',
		symbolized : 'symbolised',
		symbolizes : 'symbolises',
		symbolizing : 'symbolising',
		sympathize : 'sympathise',
		sympathized : 'sympathised',
		sympathizer : 'sympathiser',
		sympathizers : 'sympathisers',
		sympathizes : 'sympathises',
		sympathizing : 'sympathising',
		synchronization : 'synchronisation',
		synchronize : 'synchronise',
		synchronized : 'synchronised',
		synchronizes : 'synchronises',
		synchronizing : 'synchronising',
		synthesize : 'synthesise',
		synthesized : 'synthesised',
		synthesizer : 'synthesiser',
		synthesizers : 'synthesisers',
		synthesizes : 'synthesises',
		synthesizing : 'synthesising',
		siphon : 'syphon',
		siphoned : 'syphoned',
		siphoning : 'syphoning',
		siphons : 'syphons',
		systematization : 'systematisation',
		systematize : 'systematise',
		systematized : 'systematised',
		systematizes : 'systematises',
		systematizing : 'systematising',
		tantalize : 'tantalise',
		tantalized : 'tantalised',
		tantalizes : 'tantalises',
		tantalizing : 'tantalising',
		tantalizingly : 'tantalisingly',
		tasseled : 'tasselled',
		technicolor : 'technicolour',
		temporize : 'temporise',
		temporized : 'temporised',
		temporizes : 'temporises',
		temporizing : 'temporising',
		tenderize : 'tenderise',
		tenderized : 'tenderised',
		tenderizes : 'tenderises',
		tenderizing : 'tenderising',
		terrorize : 'terrorise',
		terrorized : 'terrorised',
		terrorizes : 'terrorises',
		terrorizing : 'terrorising',
		theater : 'theatre',
		theatergoer : 'theatregoer',
		theatergoers : 'theatregoers',
		theaters : 'theatres',
		theorize : 'theorise',
		theorized : 'theorised',
		theorizes : 'theorises',
		theorizing : 'theorising',
		ton : 'tonne',
		tons : 'tonnes',
		toweled : 'towelled',
		toweling : 'towelling',
		toxemia : 'toxaemia',
		tranquilize : 'tranquillise',
		tranquilized : 'tranquillised',
		tranquilizer : 'tranquilliser',
		tranquilizers : 'tranquillisers',
		tranquilizes : 'tranquillises',
		tranquilizing : 'tranquillising',
		tranquility : 'tranquillity',
		tranquilize : 'tranquillize',
		tranquilized : 'tranquillized',
		tranquilizer : 'tranquillizer',
		tranquilizers : 'tranquillizers',
		tranquilizes : 'tranquillizes',
		tranquilizing : 'tranquillizing',
		tranquility : 'tranquilly',
		transistorized : 'transistorised',
		traumatize : 'traumatise',
		traumatized : 'traumatised',
		traumatizes : 'traumatises',
		traumatizing : 'traumatising',
		traveled : 'travelled',
		traveler : 'traveller',
		travelers : 'travellers',
		traveling : 'travelling',
		travelog : 'travelogue',
		travelogs  : 'travelogues ',
		trialed : 'trialled',
		trialing : 'trialling',
		tricolor : 'tricolour',
		tricolors : 'tricolours',
		trivialize : 'trivialise',
		trivialized : 'trivialised',
		trivializes : 'trivialises',
		trivializing : 'trivialising',
		tumor : 'tumour',
		tumors : 'tumours',
		tunneled : 'tunnelled',
		tunneling : 'tunnelling',
		tyrannize : 'tyrannise',
		tyrannized : 'tyrannised',
		tyrannizes : 'tyrannises',
		tyrannizing : 'tyrannising',
		tire : 'tyre',
		tires : 'tyres',
		unauthorized : 'unauthorised',
		uncivilized : 'uncivilised',
		underutilized : 'underutilised',
		unequaled : 'unequalled',
		unfavorable : 'unfavourable',
		unfavorably : 'unfavourably',
		unionization : 'unionisation',
		unionize : 'unionise',
		unionized : 'unionised',
		unionizes : 'unionises',
		unionizing : 'unionising',
		unorganized : 'unorganised',
		unraveled : 'unravelled',
		unraveling : 'unravelling',
		unrecognizable : 'unrecognisable',
		unrecognized : 'unrecognised',
		unrivaled : 'unrivalled',
		unsavory : 'unsavoury',
		untrammeled : 'untrammelled',
		urbanization : 'urbanisation',
		urbanize : 'urbanise',
		urbanized : 'urbanised',
		urbanizes : 'urbanises',
		urbanizing : 'urbanising',
		utilizable : 'utilisable',
		utilization : 'utilisation',
		utilize : 'utilise',
		utilized : 'utilised',
		utilizes : 'utilises',
		utilizing : 'utilising',
		valor : 'valour',
		vandalize : 'vandalise',
		vandalized : 'vandalised',
		vandalizes : 'vandalises',
		vandalizing : 'vandalising',
		vaporization : 'vaporisation',
		vaporize : 'vaporise',
		vaporized : 'vaporised',
		vaporizes : 'vaporises',
		vaporizing : 'vaporising',
		vapor : 'vapour',
		vapors : 'vapours',
		verbalize : 'verbalise',
		verbalized : 'verbalised',
		verbalizes : 'verbalises',
		verbalizing : 'verbalising',
		victimization : 'victimisation',
		victimize : 'victimise',
		victimized : 'victimised',
		victimizes : 'victimises',
		victimizing : 'victimising',
		videodisk : 'videodisc',
		videodisks : 'videodiscs',
		vigor : 'vigour',
		visualization : 'visualisation',
		visualizations : 'visualisations',
		visualize : 'visualise',
		visualized : 'visualised',
		visualizes : 'visualises',
		visualizing : 'visualising',
		vocalization : 'vocalisation',
		vocalizations : 'vocalisations',
		vocalize : 'vocalise',
		vocalized : 'vocalised',
		vocalizes : 'vocalises',
		vocalizing : 'vocalising',
		vulcanized : 'vulcanised',
		vulgarization : 'vulgarisation',
		vulgarize : 'vulgarise',
		vulgarized : 'vulgarised',
		vulgarizes : 'vulgarises',
		vulgarizing : 'vulgarising',
		wagon : 'waggon',
		wagons : 'waggons',
		watercolor : 'watercolour',
		watercolors : 'watercolours',
		weaseled : 'weaselled',
		weaseling : 'weaselling',
		westernization : 'westernisation',
		westernize : 'westernise',
		westernized : 'westernised',
		westernizes : 'westernises',
		westernizing : 'westernising',
		womanize : 'womanise',
		womanized : 'womanised',
		womanizer : 'womaniser',
		womanizers : 'womanisers',
		womanizes : 'womanises',
		womanizing : 'womanising',
		woolen : 'woollen',
		woolens : 'woollens',
		woolies : 'woollies',
		wooly : 'woolly',
		worshiped : 'worshipped ',
		worshiping  : 'worshipping ',
		worshiper : 'worshipper',
		yodeled : 'yodelled',
		yodeling : 'yodelling',
		yogurt : 'yoghourt',
		yogurts : 'yoghourts',
		yogurt : 'yoghurt',
		yogurts : 'yoghurts',
	}

}

},{}],3:[function(require,module,exports){
var angle;

angle = {
  rad: {
    name: {
      singular: 'radian'
    , plural: 'radians'
    }
  , to_anchor: 180/Math.PI
  }
, deg: {
    name: {
      singular: 'degree'
    , plural: 'degrees'
    }
  , to_anchor: 1
  }
, grad: {
    name: {
      singular: 'gradian'
    , plural: 'gradians'
    }
  , to_anchor: 9/10
  }
, arcmin: {
    name: {
      singular: 'arcminute'
    , plural: 'arcminutes'
    }
  , to_anchor: 1/60
  }
, arcsec: {
    name: {
      singular: 'arcsecond'
    , plural: 'arcseconds'
    }
  , to_anchor: 1/3600
  }
};

module.exports = {
  metric: angle
, _anchors: {
    metric: {
      unit: 'deg'
    , ratio: 1
    }
  }
};

},{}],4:[function(require,module,exports){
var apparentPower;

apparentPower = {
  VA: {
    name: {
      singular: 'Volt-Ampere'
    , plural: 'Volt-Amperes'
    }
  , to_anchor: 1
  }
, mVA: {
    name: {
      singular: 'Millivolt-Ampere'
      , plural: 'Millivolt-Amperes'
    }
    , to_anchor: .001
  }
, kVA: {
    name: {
      singular: 'Kilovolt-Ampere'
    , plural: 'Kilovolt-Amperes'
    }
  , to_anchor: 1000
  }
, MVA: {
    name: {
      singular: 'Megavolt-Ampere'
    , plural: 'Megavolt-Amperes'
    }
  , to_anchor: 1000000
  }
, GVA: {
    name: {
      singular: 'Gigavolt-Ampere'
    , plural: 'Gigavolt-Amperes'
    }
  , to_anchor: 1000000000
  }
};

module.exports = {
  metric: apparentPower
, _anchors: {
    metric: {
      unit: 'VA'
    , ratio: 1
    }
  }
};

},{}],5:[function(require,module,exports){
var metric
  , imperial;

metric = {
  mm2: {
    name: {
      singular: 'Square Millimeter'
    , plural: 'Square Millimeters'
    }
  , to_anchor: 1/1000000
  }
, cm2: {
    name: {
      singular: 'Centimeter'
    , plural: 'Centimeters'
    }
  , to_anchor: 1/10000
  }
, m2: {
    name: {
      singular: 'Square Meter'
    , plural: 'Square Meters'
    }
  , to_anchor: 1
  }
, ha: {
    name: {
      singular: 'Hectare'
    , plural: 'Hectares'
    }
  , to_anchor: 10000
  }
, km2: {
    name: {
      singular: 'Square Kilometer'
    , plural: 'Square Kilometers'
    }
  , to_anchor: 1000000
  }
};

imperial = {
  'in2': {
    name: {
      singular: 'Square Inch'
    , plural: 'Square Inches'
    }
  , to_anchor: 1/144
  }
, yd2: {
    name: {
      singular: 'Square Yard'
    , plural: 'Square Yards'  
    }
  , to_anchor: 9
  }
, ft2: {
    name: {
      singular: 'Square Foot'
    , plural: 'Square Feet'
    }
  , to_anchor: 1
  }
, ac: {
    name: {
      singular: 'Acre'
    , plural: 'Acres'
    }
  , to_anchor: 43560
  }
, mi2: {
    name: {
      singular: 'Square Mile'
    , plural: 'Square Miles'
    }
  , to_anchor: 27878400
  }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'm2'
    , ratio: 10.7639
    }
  , imperial: {
      unit: 'ft2'
    , ratio: 1/10.7639
    }
  }
};

},{}],6:[function(require,module,exports){
var current;

current = {
  A: {
    name: {
      singular: 'Ampere'
    , plural: 'Amperes'
    }
  , to_anchor: 1
  }
, mA: {
    name: {
      singular: 'Milliampere'
      , plural: 'Milliamperes'
    }
    , to_anchor: .001
  }
, kA: {
    name: {
      singular: 'Kiloampere'
    , plural: 'Kiloamperes'
    }
  , to_anchor: 1000
  }
};

module.exports = {
  metric: current
, _anchors: {
    metric: {
      unit: 'A'
    , ratio: 1
    }
  }
};

},{}],7:[function(require,module,exports){
var bits
  , bytes;

bits = {
  b: {
    name: {
      singular: 'Bit'
    , plural: 'Bits'
    }
  , to_anchor: 1
  }
, Kb: {
    name: {
      singular: 'Kilobit'
    , plural: 'Kilobits'
    }
  , to_anchor: 1024
  }
, Mb: {
    name: {
      singular: 'Megabit'
    , plural: 'Megabits'
    }
  , to_anchor: 1048576
  }
, Gb: {
    name: {
      singular: 'Gigabit'
    , plural: 'Gigabits'
    }
  , to_anchor: 1073741824
  }
, Tb: {
    name: {
      singular: 'Terabit'
    , plural: 'Terabits'
    }
  , to_anchor: 1099511627776
  }
};

bytes = {
  B: {
    name: {
      singular: 'Byte'
    , plural: 'Bytes'
    }
  , to_anchor: 1
  }
, KB: {
    name: {
      singular: 'Kilobyte'
    , plural: 'Kilobytes'
    }
  , to_anchor: 1024
  }
, MB: {
    name: {
      singular: 'Megabyte'
    , plural: 'Megabytes'
    }
  , to_anchor: 1048576
  }
, GB: {
    name: {
      singular: 'Gigabyte'
    , plural: 'Gigabytes'
    }
  , to_anchor: 1073741824
  }
, TB: {
    name: {
      singular: 'Terabyte'
    , plural: 'Terabytes'
    }
  , to_anchor: 1099511627776
  }
};

module.exports = {
  bits: bits
, bytes: bytes
, _anchors: {
    bits: {
      unit: 'b'
    , ratio: 1/8
    }
  , bytes: {
      unit: 'B'
    , ratio: 8
    }
  }
};

},{}],8:[function(require,module,exports){
var metric
  , imperial;

metric = {
  ea: {
    name: {
      singular: 'Each'
    , plural: 'Each'
    }
  , to_anchor: 1
  },
  dz: {
    name: {
      singular: 'Dozen'
    , plural: 'Dozens'
    }
  , to_anchor: 12
  }
};

module.exports = {
  metric: metric
, imperial: {}
, _anchors: {
    metric: {
      unit: 'ea'
    , ratio: 1
    }
  }
};

},{}],9:[function(require,module,exports){
var energy;

energy = {
  Wh: {
    name: {
      singular: 'Watt-hour'
    , plural: 'Watt-hours'
    }
  , to_anchor: 3600
  }
, mWh: {
    name: {
      singular: 'Milliwatt-hour'
      , plural: 'Milliwatt-hours'
    }
    , to_anchor: 3.6
  }
, kWh: {
    name: {
      singular: 'Kilowatt-hour'
    , plural: 'Kilowatt-hours'
    }
  , to_anchor: 3600000
  }
, MWh: {
    name: {
      singular: 'Megawatt-hour'
    , plural: 'Megawatt-hours'
    }
  , to_anchor: 3600000000
  }
, GWh: {
    name: {
      singular: 'Gigawatt-hour'
    , plural: 'Gigawatt-hours'
    }
  , to_anchor: 3600000000000
  }
, J: {
    name: {
      singular: 'Joule'
    , plural: 'Joules'
    }
  , to_anchor: 1
  }
, kJ: {
    name: {
      singular: 'Kilojoule'
    , plural: 'Kilojoules'
    }
  , to_anchor: 1000
  }
};

module.exports = {
  metric: energy
, _anchors: {
    metric: {
      unit: 'J'
    , ratio: 1
    }
  }
};

},{}],10:[function(require,module,exports){
var frequency;

frequency = {
  mHz: {
    name: {
      singular: 'millihertz'
    , plural: 'millihertz'
    }
  , to_anchor: 1/1000
  }
, Hz: {
    name: {
      singular: 'hertz'
    , plural: 'hertz'
    }
  , to_anchor: 1
  }
, kHz: {
    name: {
      singular: 'kilohertz'
    , plural: 'kilohertz'
    }
  , to_anchor: 1000
  }
, MHz: {
    name: {
      singular: 'megahertz'
    , plural: 'megahertz'
    }
  , to_anchor: 1000 * 1000
  }
, GHz: {
    name: {
      singular: 'gigahertz'
    , plural: 'gigahertz'
    }
  , to_anchor: 1000 * 1000 * 1000
  }
, THz: {
    name: {
      singular: 'terahertz'
    , plural: 'terahertz'
    }
  , to_anchor: 1000 * 1000 * 1000 * 1000
  }
, rpm: {
    name: {
      singular: 'rotation per minute'
    , plural: 'rotations per minute'
    }
  , to_anchor: 1/60
  }
, "deg/s": {
    name: {
      singular: 'degree per second'
    , plural: 'degrees per second'
    }
  , to_anchor: 1/360
  }
, "rad/s": {
    name: {
      singular: 'radian per second'
    , plural: 'radians per second'
    }
  , to_anchor: 1/(Math.PI * 2)
  }
};


module.exports = {
  metric: frequency
, _anchors: {
    frequency: {
      unit: 'hz'
    , ratio: 1
    }
  }
};

},{}],11:[function(require,module,exports){
var metric,
imperial;

metric = {
  'lx': {
    name: {
      singular: 'Lux',
      plural: 'Lux'
    },
    to_anchor: 1
  }
};

imperial = {
  'ft-cd': {
    name: {
      singular: 'Foot-candle',
      plural: 'Foot-candles'
    },
    to_anchor: 1
  }
};

module.exports = {
  metric: metric,
  imperial: imperial,
  _anchors: {
    metric: {
      unit: 'lx',
      ratio: 1/10.76391
    },
    imperial: {
      unit: 'ft-cd',      
	  ratio: 10.76391
    }
  }
};

},{}],12:[function(require,module,exports){
var metric,
imperial;

metric = {
  mm: {
    name: {
      singular: 'Millimeter',
      plural: 'Millimeters'
    },
    to_anchor: 1/1000
  },
  cm: {
    name: {
      singular: 'Centimeter',
      plural: 'Centimeters'
    },
    to_anchor: 1/100
  },
  m: {
    name: {
      singular: 'Meter',
      plural: 'Meters'
    },
    to_anchor: 1
  },
  km: {
    name: {
      singular: 'Kilometer',
      plural: 'Kilometers'
    },
    to_anchor: 1000
  }
};

imperial = {
  'in': {
    name: {
      singular: 'Inch',
      plural: 'Inches'
    },
    to_anchor: 1/12
  },
  yd: {
    name: {
      singular: 'Yard',
      plural: 'Yards'
    },
    to_anchor: 3
  },
  'ft-us': {
    name: {
      singular: 'US Survey Foot',
      plural: 'US Survey Feet'
    },
    to_anchor: 1.000002
  },
  ft: {
    name: {
      singular: 'Foot',
      plural: 'Feet'
    },
    to_anchor: 1
  },
  mi: {
    name: {
      singular: 'Mile',
      plural: 'Miles'
    },
    to_anchor: 5280
  }
};

module.exports = {
  metric: metric,
  imperial: imperial,
  _anchors: {
    metric: {
      unit: 'm',
      ratio: 3.28084
    },
    imperial: {
      unit: 'ft',
      ratio: 1/3.28084
    }
  }
};

},{}],13:[function(require,module,exports){
var metric
  , imperial;

metric = {
  mcg: {
    name: {
      singular: 'Microgram'
    , plural: 'Micrograms'
    }
  , to_anchor: 1/1000000
  }
, mg: {
    name: {
      singular: 'Milligram'
    , plural: 'Milligrams'
    }
  , to_anchor: 1/1000
  }
, g: {
    name: {
      singular: 'Gram'
    , plural: 'Grams'
    }
  , to_anchor: 1
  }
, kg: {
    name: {
      singular: 'Kilogram'
    , plural: 'Kilograms'
    }
  , to_anchor: 1000
}
, mt: {
    name: {
      singular: 'Metric Tonne'
    , plural: 'Metric Tonnes'
    }
  , to_anchor: 1000000
  }
};

imperial = {
  oz: {
    name: {
      singular: 'Ounce'
    , plural: 'Ounces'
    }
  , to_anchor: 1/16
  }
, lb: {
    name: {
      singular: 'Pound'
    , plural: 'Pounds'
    }
  , to_anchor: 1
}, t: {
  name: {
    singular: 'Ton',
    plural: 'Tons',
  },
    to_anchor: 2000,
  },
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'g'
    , ratio: 1/453.592
    }
  , imperial: {
      unit: 'lb'
    , ratio: 453.592
    }
  }
};

},{}],14:[function(require,module,exports){
var metric
  , imperial;

metric = {
  'min/km': {
    name: {
      singular: 'Minute per kilometre'
    , plural: 'Minutes per kilometre'
    }
  , to_anchor: 0.06
  }
  ,'s/m': {
    name: {
      singular: 'Second per metre'
    , plural: 'Seconds per metre'
    }
  , to_anchor: 1
  }
}

imperial = {
    'min/mi': {
      name: {
        singular: 'Minute per mile'
      , plural: 'Minutes per mile'
      }
    , to_anchor: 0.0113636
   }
   , 's/ft': {
      name: {
        singular: 'Second per foot'
      , plural: 'Seconds per foot'
      }
    , to_anchor: 1
   }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 's/m'
    , ratio: 0.3048
    }
  , imperial: {
      unit: 's/ft'
    , ratio: 1/0.3048
    }
  }
};

},{}],15:[function(require,module,exports){
var metric
  , imperial;

metric = {
  ppm: {
    name: {
      singular: 'Part-per Million'
      , plural: 'Parts-per Million'
    }
    , to_anchor: 1
  }
  , ppb: {
    name: {
      singular: 'Part-per Billion'
      , plural: 'Parts-per Billion'
    }
    , to_anchor: .001
  }
  , ppt: {
    name: {
      singular: 'Part-per Trillion'
      , plural: 'Parts-per Trillion'
    }
    , to_anchor: .000001
  }
  , ppq: {
    name: {
      singular: 'Part-per Quadrillion'
      , plural: 'Parts-per Quadrillion'
    }
    , to_anchor: .000000001
  }
};

module.exports = {
  metric: metric
  , imperial: {}
  , _anchors: {
    metric: {
      unit: 'ppm'
      , ratio: .000001
    }
  }
};

},{}],16:[function(require,module,exports){
var power;

power = {
  W: {
    name: {
      singular: 'Watt'
    , plural: 'Watts'
    }
  , to_anchor: 1
  }
, mW: {
    name: {
      singular: 'Milliwatt'
      , plural: 'Milliwatts'
    }
    , to_anchor: .001
  }
, kW: {
    name: {
      singular: 'Kilowatt'
    , plural: 'Kilowatts'
    }
  , to_anchor: 1000
  }
, MW: {
    name: {
      singular: 'Megawatt'
    , plural: 'Megawatts'
    }
  , to_anchor: 1000000
  }
, GW: {
    name: {
      singular: 'Gigawatt'
    , plural: 'Gigawatts'
    }
  , to_anchor: 1000000000
  }
};

module.exports = {
  metric: power
, _anchors: {
    metric: {
      unit: 'W'
    , ratio: 1
    }
  }
};

},{}],17:[function(require,module,exports){
var metric
  , imperial;

metric = {
  Pa: {
    name: {
      singular: 'pascal'
    , plural: 'pascals'
    }
  , to_anchor: 1/1000
  }
, kPa: {
    name: {
      singular: 'kilopascal'
    , plural: 'kilopascals'
    }
  , to_anchor: 1
  }
, MPa: {
    name: {
      singular: 'megapascal'
    , plural: 'megapascals'
    }
  , to_anchor: 1000
  }
, hPa: {
    name: {
      singular: 'hectopascal'
    , plural: 'hectopascals'
    }
  , to_anchor: 1/10
  }
, bar: {
    name: {
      singular: 'bar'
    , plural: 'bar'
    }
  , to_anchor: 100
  }
, torr: {
    name: {
      singular: 'torr'
    , plural: 'torr'
    }
  , to_anchor: 101325/760000
  }
};

imperial = {
  psi: {
    name: {
      singular: 'pound per square inch'
    , plural: 'pounds per square inch'
    }
  , to_anchor: 1/1000
  }
, ksi: {
    name: {
      singular: 'kilopound per square inch'
    , plural: 'kilopound per square inch'
    }
  , to_anchor: 1
  }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'kPa'
    , ratio: 0.00014503768078
    }
  , imperial: {
      unit: 'psi'
    , ratio: 1/0.00014503768078
    }
  }
};

},{}],18:[function(require,module,exports){
var reactiveEnergy;

reactiveEnergy = {
  VARh: {
    name: {
      singular: 'Volt-Ampere Reactive Hour'
    , plural: 'Volt-Amperes Reactive Hour'
    }
  , to_anchor: 1
  }
, mVARh: {
    name: {
      singular: 'Millivolt-Ampere Reactive Hour'
      , plural: 'Millivolt-Amperes Reactive Hour'
    }
    , to_anchor: .001
  }
, kVARh: {
    name: {
      singular: 'Kilovolt-Ampere Reactive Hour'
    , plural: 'Kilovolt-Amperes Reactive Hour'
    }
  , to_anchor: 1000
  }
, MVARh: {
    name: {
      singular: 'Megavolt-Ampere Reactive Hour'
    , plural: 'Megavolt-Amperes Reactive Hour'
    }
  , to_anchor: 1000000
  }
, GVARh: {
    name: {
      singular: 'Gigavolt-Ampere Reactive Hour'
    , plural: 'Gigavolt-Amperes Reactive Hour'
    }
  , to_anchor: 1000000000
  }
};

module.exports = {
  metric: reactiveEnergy
, _anchors: {
    metric: {
      unit: 'VARh'
    , ratio: 1
    }
  }
};

},{}],19:[function(require,module,exports){
var reactivePower;

reactivePower = {
  VAR: {
    name: {
      singular: 'Volt-Ampere Reactive'
    , plural: 'Volt-Amperes Reactive'
    }
  , to_anchor: 1
  }
, mVAR: {
    name: {
      singular: 'Millivolt-Ampere Reactive'
      , plural: 'Millivolt-Amperes Reactive'
    }
    , to_anchor: .001
  }
, kVAR: {
    name: {
      singular: 'Kilovolt-Ampere Reactive'
    , plural: 'Kilovolt-Amperes Reactive'
    }
  , to_anchor: 1000
  }
, MVAR: {
    name: {
      singular: 'Megavolt-Ampere Reactive'
    , plural: 'Megavolt-Amperes Reactive'
    }
  , to_anchor: 1000000
  }
, GVAR: {
    name: {
      singular: 'Gigavolt-Ampere Reactive'
    , plural: 'Gigavolt-Amperes Reactive'
    }
  , to_anchor: 1000000000
  }
};

module.exports = {
  metric: reactivePower
, _anchors: {
    metric: {
      unit: 'VAR'
    , ratio: 1
    }
  }
};

},{}],20:[function(require,module,exports){
var metric
  , imperial;

metric = {
  'm/s': {
    name: {
      singular: 'Metre per second'
    , plural: 'Metres per second'
    }
  , to_anchor: 3.6
  }
, 'km/h': {
    name: {
      singular: 'Kilometre per hour'
    , plural: 'Kilometres per hour'
    }
  , to_anchor: 1
  }
}

  imperial = {
    'm/h': {
      name: {
        singular: 'Mile per hour'
      , plural: 'Miles per hour'
      }
    , to_anchor: 1
    }
  , knot: {
      name: {
        singular: 'Knot'
      , plural: 'Knots'
      }
    , to_anchor: 1.150779
    }
  , 'ft/s': {
      name: {
        singular: 'Foot per second'
      , plural: 'Feet per second'
      }
    , to_anchor: 0.681818
      }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'km/h'
    , ratio: 1/1.609344
    }
  , imperial: {
      unit: 'm/h'
    , ratio: 1.609344
    }
  }
};

},{}],21:[function(require,module,exports){
var metric
  , imperial;

metric = {
  C: {
    name: {
      singular: 'degree Celsius'
    , plural: 'degrees Celsius'
    }
  , to_anchor: 1
  , anchor_shift: 0
  },
  K: {
    name: {
      singular: 'degree Kelvin'
    , plural: 'degrees Kelvin'
    }
  , to_anchor: 1
  , anchor_shift: 273.15
  }
};

imperial = {
  F: {
    name: {
      singular: 'degree Fahrenheit'
    , plural: 'degrees Fahrenheit'
    }
  , to_anchor: 1
  },
  R: {
    name: {
      singular: 'degree Rankine'
    , plural: 'degrees Rankine'
    }
  , to_anchor: 1
  , anchor_shift: 459.67
  }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'C'
    , transform: function (C) { return C / (5/9) + 32 }
    }
  , imperial: {
      unit: 'F'
    , transform: function (F) { return (F - 32) * (5/9) }
    }
  }
};


},{}],22:[function(require,module,exports){
var time;
var daysInYear = 365.25;

time = {
  ns: {
    name: {
      singular: 'Nanosecond'
    , plural: 'Nanoseconds'
    }
  , to_anchor: 1/1000000000
  }
, mu: {
    name: {
      singular: 'Microsecond'
    , plural: 'Microseconds'
    }
  , to_anchor: 1/1000000
  }
, ms: {
    name: {
      singular: 'Millisecond'
    , plural: 'Milliseconds'
    }
  , to_anchor: 1/1000
  }
, s: {
    name: {
      singular: 'Second'
    , plural: 'Seconds'
    }
  , to_anchor: 1
  }
, min: {
    name: {
      singular: 'Minute'
    , plural: 'Minutes'
    }
  , to_anchor: 60
  }
, h: {
    name: {
      singular: 'Hour'
    , plural: 'Hours'
    }
  , to_anchor: 60 * 60 
  }
, d: {
    name: {
      singular: 'Day'
    , plural: 'Days'
    }
  , to_anchor: 60 * 60 * 24
  }
, week: {
    name: {
      singular: 'Week'
    , plural: 'Weeks'
    }
  , to_anchor: 60 * 60 * 24 * 7
  }
, month: {
    name: {
      singular: 'Month'
    , plural: 'Months'
    }
  , to_anchor: 60 * 60 * 24 * daysInYear / 12
  }
, year: {
    name: {
      singular: 'Year'
    , plural: 'Years'
    }
  , to_anchor: 60 * 60 * 24 * daysInYear
  }
};


module.exports = {
  metric: time 
, _anchors: {
    metric: {
      unit: 's'
    , ratio: 1
    }
  }
};

},{}],23:[function(require,module,exports){
var voltage;

voltage = {
  V: {
    name: {
      singular: 'Volt'
    , plural: 'Volts'
    }
  , to_anchor: 1
  }
, mV: {
    name: {
      singular: 'Millivolt'
      , plural: 'Millivolts'
    }
    , to_anchor: .001
  }
, kV: {
    name: {
      singular: 'Kilovolt'
    , plural: 'Kilovolts'
    }
  , to_anchor: 1000
  }
};

module.exports = {
  metric: voltage
, _anchors: {
    metric: {
      unit: 'V'
    , ratio: 1
    }
  }
};

},{}],24:[function(require,module,exports){
var metric
  , imperial;

metric = {
  mm3: {
      name: {
        singular: 'Cubic Millimeter'
      , plural: 'Cubic Millimeters'
      }
    , to_anchor: 1/1000000
  }
, cm3: {
    name: {
      singular: 'Cubic Centimeter'
    , plural: 'Cubic Centimeters'
    }
  , to_anchor: 1/1000
  }
, ml: {
    name: {
      singular: 'Millilitre'
    , plural: 'Millilitres'
    }
  , to_anchor: 1/1000
  }
, cl: {
    name: {
      singular: 'Centilitre'
    , plural: 'Centilitres'
    }
  , to_anchor: 1/100
  }
, dl: {
    name: {
      singular: 'Decilitre'
    , plural: 'Decilitres'
    }
  , to_anchor: 1/10
  }
, l: {
    name: {
      singular: 'Litre'
    , plural: 'Litres'
    }
  , to_anchor: 1
  }
, kl: {
    name: {
      singular: 'Kilolitre'
    , plural: 'Kilolitres'
    }
  , to_anchor: 1000
  }
, m3: {
    name: {
      singular: 'Cubic meter'
    , plural: 'Cubic meters'
    }
  , to_anchor: 1000
  }
, km3: {
    name: {
      singular: 'Cubic kilometer'
    , plural: 'Cubic kilometers'
    }
  , to_anchor: 1000000000000
  }

// Swedish units
, krm: {
  name: {
    singular: 'Matsked'
    , plural: 'Matskedar'
  }
  , to_anchor: 1/1000
}
, tsk: {
    name: {
      singular: 'Tesked'
    , plural: 'Teskedar'
    }
  , to_anchor: 5/1000
  }
, msk: {
    name: {
      singular: 'Matsked'
      , plural: 'Matskedar'
    }
    , to_anchor: 15/1000
  }
, kkp: {
    name: {
      singular: 'Kaffekopp'
      , plural: 'Kaffekoppar'
    }
    , to_anchor: 150/1000
  }
, glas: {
    name: {
      singular: 'Glas'
      , plural: 'Glas'
    }
    , to_anchor: 200/1000
  }
, kanna: {
    name: {
      singular: 'Kanna'
    , plural: 'Kannor'
    }
  , to_anchor: 2.617
  }
};

imperial = {
  tsp: {
    name: {
      singular: 'Teaspoon'
    , plural: 'Teaspoons'
    }
  , to_anchor: 1/6
  }
, Tbs: {
    name: {
      singular: 'Tablespoon'
    , plural: 'Tablespoons'
    }
  , to_anchor: 1/2
  }
, in3: {
    name: {
      singular: 'Cubic inch'
    , plural: 'Cubic inches'
    }
  , to_anchor: 0.55411
  }
, 'fl-oz': {
    name: {
      singular: 'Fluid Ounce'
    , plural: 'Fluid Ounces'
    }
  , to_anchor: 1
  }
, cup: {
    name: {
      singular: 'Cup'
    , plural: 'Cups'
    }
  , to_anchor: 8
  }
, pnt: {
    name: {
      singular: 'Pint'
    , plural: 'Pints'
    }
  , to_anchor: 16
  }
, qt: {
    name: {
      singular: 'Quart'
    , plural: 'Quarts'
    }
  , to_anchor: 32
  }
, gal: {
    name: {
      singular: 'Gallon'
    , plural: 'Gallons'
    }
  , to_anchor: 128
  }
, ft3: {
    name: {
      singular: 'Cubic foot'
    , plural: 'Cubic feet'
    }
  , to_anchor: 957.506
  }
, yd3: {
    name: {
      singular: 'Cubic yard'
    , plural: 'Cubic yards'
    }
  , to_anchor: 25852.7
  }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'l'
    , ratio: 33.8140226
    }
  , imperial: {
      unit: 'fl-oz'
    , ratio: 1/33.8140226
    }
  }
};

},{}],25:[function(require,module,exports){
var metric
  , imperial;

metric = {
  'mm3/s': {
      name: {
        singular: 'Cubic Millimeter per second'
      , plural: 'Cubic Millimeters per second'
      }
    , to_anchor: 1/1000000
  }
, 'cm3/s': {
    name: {
      singular: 'Cubic Centimeter per second'
    , plural: 'Cubic Centimeters per second'
    }
  , to_anchor: 1/1000
  }
, 'ml/s': {
    name: {
      singular: 'Millilitre per second'
    , plural: 'Millilitres per second'
    }
  , to_anchor: 1/1000
  }
, 'cl/s': {
    name: {
      singular: 'Centilitre per second'
    , plural: 'Centilitres per second'
    }
  , to_anchor: 1/100
  }
, 'dl/s': {
    name: {
      singular: 'Decilitre per second'
    , plural: 'Decilitres per second'
    }
  , to_anchor: 1/10
  }
, 'l/s': {
    name: {
      singular: 'Litre per second'
    , plural: 'Litres per second'
    }
  , to_anchor: 1
  }
, 'l/min': {
    name: {
      singular: 'Litre per minute'
    , plural: 'Litres per minute'
    }
  , to_anchor: 1/60
  }
, 'l/h': {
    name: {
      singular: 'Litre per hour'
    , plural: 'Litres per hour'
    }
  , to_anchor: 1/3600
  }
, 'kl/s': {
    name: {
      singular: 'Kilolitre per second'
    , plural: 'Kilolitres per second'
    }
  , to_anchor: 1000
  }
, 'kl/min': {
    name: {
      singular: 'Kilolitre per minute'
    , plural: 'Kilolitres per minute'
    }
  , to_anchor: 50/3
  }
, 'kl/h': {
    name: {
      singular: 'Kilolitre per hour'
    , plural: 'Kilolitres per hour'
    }
  , to_anchor: 5/18
  }
, 'm3/s': {
    name: {
      singular: 'Cubic meter per second'
    , plural: 'Cubic meters per second'
    }
  , to_anchor: 1000
  }
, 'm3/min': {
    name: {
      singular: 'Cubic meter per minute'
    , plural: 'Cubic meters per minute'
    }
  , to_anchor: 50/3
  }
, 'm3/h': {
    name: {
      singular: 'Cubic meter per hour'
    , plural: 'Cubic meters per hour'
    }
  , to_anchor: 5/18
  }
, 'km3/s': {
    name: {
      singular: 'Cubic kilometer per second'
    , plural: 'Cubic kilometers per second'
    }
  , to_anchor: 1000000000000
  }
};

imperial = {
  'tsp/s': {
    name: {
      singular: 'Teaspoon per second'
    , plural: 'Teaspoons per second'
    }
  , to_anchor: 1/6
  }
, 'Tbs/s': {
    name: {
      singular: 'Tablespoon per second'
    , plural: 'Tablespoons per second'
    }
  , to_anchor: 1/2
  }
, 'in3/s': {
    name: {
      singular: 'Cubic inch per second'
    , plural: 'Cubic inches per second'
    }
  , to_anchor: 0.55411
  }
, 'in3/min': {
    name: {
      singular: 'Cubic inch per minute'
    , plural: 'Cubic inches per minute'
    }
  , to_anchor: 0.55411/60
  }
, 'in3/h': {
    name: {
      singular: 'Cubic inch per hour'
    , plural: 'Cubic inches per hour'
    }
  , to_anchor: 0.55411/3600
  }
, 'fl-oz/s': {
    name: {
      singular: 'Fluid Ounce per second'
    , plural: 'Fluid Ounces per second'
    }
  , to_anchor: 1
  }
, 'fl-oz/min': {
    name: {
      singular: 'Fluid Ounce per minute'
    , plural: 'Fluid Ounces per minute'
    }
  , to_anchor: 1/60
  }
, 'fl-oz/h': {
    name: {
      singular: 'Fluid Ounce per hour'
    , plural: 'Fluid Ounces per hour'
    }
  , to_anchor: 1/3600
  }
, 'cup/s': {
    name: {
      singular: 'Cup per second'
    , plural: 'Cups per second'
    }
  , to_anchor: 8
  }
, 'pnt/s': {
    name: {
      singular: 'Pint per second'
    , plural: 'Pints per second'
    }
  , to_anchor: 16
  }
, 'pnt/min': {
    name: {
      singular: 'Pint per minute'
    , plural: 'Pints per minute'
    }
  , to_anchor: 4/15
  }
, 'pnt/h': {
    name: {
      singular: 'Pint per hour'
    , plural: 'Pints per hour'
    }
  , to_anchor: 1/225
  }
, 'qt/s': {
    name: {
      singular: 'Quart per second'
    , plural: 'Quarts per second'
    }
  , to_anchor: 32
  }
, 'gal/s': {
    name: {
      singular: 'Gallon per second'
    , plural: 'Gallons per second'
    }
  , to_anchor: 128
  }
, 'gal/min': {
    name: {
      singular: 'Gallon per minute'
    , plural: 'Gallons per minute'
    }
  , to_anchor: 32/15
  }
, 'gal/h': {
    name: {
      singular: 'Gallon per hour'
    , plural: 'Gallons per hour'
    }
  , to_anchor: 8/225
  }
, 'ft3/s': {
    name: {
      singular: 'Cubic foot per second'
    , plural: 'Cubic feet per second'
    }
  , to_anchor: 957.506
  }
, 'ft3/min': {
    name: {
      singular: 'Cubic foot per minute'
    , plural: 'Cubic feet per minute'
    }
  , to_anchor: 957.506/60
  }
, 'ft3/h': {
    name: {
      singular: 'Cubic foot per hour'
    , plural: 'Cubic feet per hour'
    }
  , to_anchor: 957.506/3600
  }
, 'yd3/s': {
    name: {
      singular: 'Cubic yard per second'
    , plural: 'Cubic yards per second'
    }
  , to_anchor: 25852.7
  }
, 'yd3/min': {
    name: {
      singular: 'Cubic yard per minute'
    , plural: 'Cubic yards per minute'
    }
  , to_anchor: 25852.7/60
  }
, 'yd3/h': {
    name: {
      singular: 'Cubic yard per hour'
    , plural: 'Cubic yards per hour'
    }
  , to_anchor: 25852.7/3600
  }
};

module.exports = {
  metric: metric
, imperial: imperial
, _anchors: {
    metric: {
      unit: 'l/s'
    , ratio: 33.8140227
    }
  , imperial: {
      unit: 'fl-oz/s'
    , ratio: 1/33.8140227
    }
  }
};

},{}],26:[function(require,module,exports){
var convert
  , keys = require('lodash.keys')
  , each = require('lodash.foreach')
  , measures = {
      length: require('./definitions/length')
    , area: require('./definitions/area')
    , mass: require('./definitions/mass')
    , volume: require('./definitions/volume')
    , each: require('./definitions/each')
    , temperature: require('./definitions/temperature')
    , time: require('./definitions/time')
    , digital: require('./definitions/digital')
    , partsPer: require('./definitions/partsPer')
    , speed: require('./definitions/speed')
    , pace: require('./definitions/pace')
    , pressure: require('./definitions/pressure')
    , current: require('./definitions/current')
    , voltage: require('./definitions/voltage')
    , power: require('./definitions/power')
    , reactivePower: require('./definitions/reactivePower')
    , apparentPower: require('./definitions/apparentPower')
    , energy: require('./definitions/energy')
    , reactiveEnergy: require('./definitions/reactiveEnergy')
    , volumeFlowRate: require('./definitions/volumeFlowRate')
    , illuminance: require('./definitions/illuminance')
    , frequency: require('./definitions/frequency')
    , angle : require('./definitions/angle')
    }
  , Converter;

Converter = function (numerator, denominator) {
  if(denominator)
    this.val = numerator / denominator;
  else
    this.val = numerator;
};

/**
* Lets the converter know the source unit abbreviation
*/
Converter.prototype.from = function (from) {
  if(this.destination)
    throw new Error('.from must be called before .to');

  this.origin = this.getUnit(from);

  if(!this.origin) {
    this.throwUnsupportedUnitError(from);
  }

  return this;
};

/**
* Converts the unit and returns the value
*/
Converter.prototype.to = function (to) {
  if(!this.origin)
    throw new Error('.to must be called after .from');

  this.destination = this.getUnit(to);

  var result
    , transform;

  if(!this.destination) {
    this.throwUnsupportedUnitError(to);
  }

  // Don't change the value if origin and destination are the same
  if (this.origin.abbr === this.destination.abbr) {
    return this.val;
  }

  // You can't go from liquid to mass, for example
  if(this.destination.measure != this.origin.measure) {
    throw new Error('Cannot convert incompatible measures of '
      + this.destination.measure + ' and ' + this.origin.measure);
  }

  /**
  * Convert from the source value to its anchor inside the system
  */
  result = this.val * this.origin.unit.to_anchor;

  /**
  * For some changes it's a simple shift (C to K)
  * So we'll add it when convering into the unit (later)
  * and subtract it when converting from the unit
  */
  if (this.origin.unit.anchor_shift) {
    result -= this.origin.unit.anchor_shift
  }

  /**
  * Convert from one system to another through the anchor ratio. Some conversions
  * aren't ratio based or require more than a simple shift. We can provide a custom
  * transform here to provide the direct result
  */
  if(this.origin.system != this.destination.system) {
    transform = measures[this.origin.measure]._anchors[this.origin.system].transform;
    if (typeof transform === 'function') {
      result = transform(result)
    }
    else {
      result *= measures[this.origin.measure]._anchors[this.origin.system].ratio;
    }
  }

  /**
  * This shift has to be done after the system conversion business
  */
  if (this.destination.unit.anchor_shift) {
    result += this.destination.unit.anchor_shift;
  }

  /**
  * Convert to another unit inside the destination system
  */
  return result / this.destination.unit.to_anchor;
};

/**
* Converts the unit to the best available unit.
*/
Converter.prototype.toBest = function(options) {
  if(!this.origin)
    throw new Error('.toBest must be called after .from');

  var options = Object.assign({
    exclude: [],
    cutOffNumber: 1,
  }, options)

  var best;
  /**
    Looks through every possibility for the 'best' available unit.
    i.e. Where the value has the fewest numbers before the decimal point,
    but is still higher than 1.
  */
  each(this.possibilities(), function(possibility) {
    var unit = this.describe(possibility);
    var isIncluded = options.exclude.indexOf(possibility) === -1;

    if (isIncluded && unit.system === this.origin.system) {
      var result = this.to(possibility);
      if (!best || (result >= options.cutOffNumber && result < best.val)) {
        best = {
          val: result,
          unit: possibility,
          singular: unit.singular,
          plural: unit.plural
        };
      }
    }
  }.bind(this));

  return best;
}

/**
* Finds the unit
*/
Converter.prototype.getUnit = function (abbr) {
  var found;

  each(measures, function (systems, measure) {
    each(systems, function (units, system) {
      if(system == '_anchors')
        return false;

      each(units, function (unit, testAbbr) {
        if(testAbbr == abbr) {
          found = {
            abbr: abbr
          , measure: measure
          , system: system
          , unit: unit
          };
          return false;
        }
      });

      if(found)
        return false;
    });

    if(found)
      return false;
  });

  return found;
};

var describe = function(resp) {
  return {
    abbr: resp.abbr
  , measure: resp.measure
  , system: resp.system
  , singular: resp.unit.name.singular
  , plural: resp.unit.name.plural
  };
}

/**
* An alias for getUnit
*/
Converter.prototype.describe = function (abbr) {
  var resp = Converter.prototype.getUnit(abbr);
  var desc = null;

  try {
    desc = describe(resp);
  } catch(err) {
    this.throwUnsupportedUnitError(abbr);
  }

  return desc;
};

/**
* Detailed list of all supported units
*/
Converter.prototype.list = function (measure) {
  var list = [];

  each(measures, function (systems, testMeasure) {
    if(measure && measure !== testMeasure)
      return;

    each(systems, function (units, system) {
      if(system == '_anchors')
        return false;

      each(units, function (unit, abbr) {
        list = list.concat(describe({
          abbr: abbr,
          measure: testMeasure
        , system: system
        , unit: unit
        }));
      });
    });
  });

  return list;
};

Converter.prototype.throwUnsupportedUnitError = function (what) {
  var validUnits = [];

  each(measures, function (systems, measure) {
    each(systems, function (units, system) {
      if(system == '_anchors')
        return false;

      validUnits = validUnits.concat(keys(units));
    });
  });

  throw new Error('Unsupported unit ' + what + ', use one of: ' + validUnits.join(', '));
}

/**
* Returns the abbreviated measures that the value can be
* converted to.
*/
Converter.prototype.possibilities = function (measure) {
  var possibilities = [];
  if(!this.origin && !measure) {
	  each(keys(measures), function (measure){
		  each(measures[measure], function (units, system) {
		    if(system == '_anchors')
		      return false;

		    possibilities = possibilities.concat(keys(units));
		  });
	  });
  } else {
	  measure = measure || this.origin.measure;
	  each(measures[measure], function (units, system) {
	    if(system == '_anchors')
	      return false;

	    possibilities = possibilities.concat(keys(units));
	  });
  }

  return possibilities;
};

/**
* Returns the abbreviated measures that the value can be
* converted to.
*/
Converter.prototype.measures = function () {
  return keys(measures);
};

convert = function (value) {
  return new Converter(value);
};

module.exports = convert;

},{"./definitions/angle":3,"./definitions/apparentPower":4,"./definitions/area":5,"./definitions/current":6,"./definitions/digital":7,"./definitions/each":8,"./definitions/energy":9,"./definitions/frequency":10,"./definitions/illuminance":11,"./definitions/length":12,"./definitions/mass":13,"./definitions/pace":14,"./definitions/partsPer":15,"./definitions/power":16,"./definitions/pressure":17,"./definitions/reactiveEnergy":18,"./definitions/reactivePower":19,"./definitions/speed":20,"./definitions/temperature":21,"./definitions/time":22,"./definitions/voltage":23,"./definitions/volume":24,"./definitions/volumeFlowRate":25,"lodash.foreach":40,"lodash.keys":45}],27:[function(require,module,exports){
;(function (globalScope) {
  'use strict';


  /*!
   *  decimal.js v10.4.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */


  // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
  var EXP_LIMIT = 9e15,                      // 0 to 9e15

    // The limit on the value of `precision`, and on the value of the first argument to
    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
    MAX_DIGITS = 1e9,                        // 0 to 1e9

    // Base conversion alphabet.
    NUMERALS = '0123456789abcdef',

    // The natural logarithm of 10 (1025 digits).
    LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',

    // Pi (1025 digits).
    PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',


    // The initial configuration properties of the Decimal constructor.
    DEFAULTS = {

      // These values must be integers within the stated ranges (inclusive).
      // Most of these values can be changed at run-time using the `Decimal.config` method.

      // The maximum number of significant digits of the result of a calculation or base conversion.
      // E.g. `Decimal.config({ precision: 20 });`
      precision: 20,                         // 1 to MAX_DIGITS

      // The rounding mode used when rounding to `precision`.
      //
      // ROUND_UP         0 Away from zero.
      // ROUND_DOWN       1 Towards zero.
      // ROUND_CEIL       2 Towards +Infinity.
      // ROUND_FLOOR      3 Towards -Infinity.
      // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      //
      // E.g.
      // `Decimal.rounding = 4;`
      // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
      rounding: 4,                           // 0 to 8

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP         0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
      // FLOOR      3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN  6 The IEEE 754 remainder function.
      // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
      //
      // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
      // division (9) are commonly used for the modulus operation. The other rounding modes can also
      // be used, but they may not give useful results.
      modulo: 1,                             // 0 to 9

      // The exponent value at and beneath which `toString` returns exponential notation.
      // JavaScript numbers: -7
      toExpNeg: -7,                          // 0 to -EXP_LIMIT

      // The exponent value at and above which `toString` returns exponential notation.
      // JavaScript numbers: 21
      toExpPos:  21,                         // 0 to EXP_LIMIT

      // The minimum exponent value, beneath which underflow to zero occurs.
      // JavaScript numbers: -324  (5e-324)
      minE: -EXP_LIMIT,                      // -1 to -EXP_LIMIT

      // The maximum exponent value, above which overflow to Infinity occurs.
      // JavaScript numbers: 308  (1.7976931348623157e+308)
      maxE: EXP_LIMIT,                       // 1 to EXP_LIMIT

      // Whether to use cryptographically-secure random number generation, if available.
      crypto: false                          // true/false
    },


  // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


    Decimal, inexact, noConflict, quadrant,
    external = true,

    decimalError = '[DecimalError] ',
    invalidArgument = decimalError + 'Invalid argument: ',
    precisionLimitExceeded = decimalError + 'Precision limit exceeded',
    cryptoUnavailable = decimalError + 'crypto unavailable',
    tag = '[object Decimal]',

    mathfloor = Math.floor,
    mathpow = Math.pow,

    isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

    BASE = 1e7,
    LOG_BASE = 7,
    MAX_SAFE_INTEGER = 9007199254740991,

    LN10_PRECISION = LN10.length - 1,
    PI_PRECISION = PI.length - 1,

    // Decimal.prototype object
    P = { toStringTag: tag };


  // Decimal prototype methods


  /*
   *  absoluteValue             abs
   *  ceil
   *  clampedTo                 clamp
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf                   toJSON
   */


  /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */
  P.absoluteValue = P.abs = function () {
    var x = new this.constructor(this);
    if (x.s < 0) x.s = 1;
    return finalise(x);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */
  P.ceil = function () {
    return finalise(new this.constructor(this), this.e + 1, 2);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal clamped to the range
   * delineated by `min` and `max`.
   *
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */
  P.clampedTo = P.clamp = function (min, max) {
    var k,
      x = this,
      Ctor = x.constructor;
    min = new Ctor(min);
    max = new Ctor(max);
    if (!min.s || !max.s) return new Ctor(NaN);
    if (min.gt(max)) throw Error(invalidArgument + max);
    k = x.cmp(min);
    return k < 0 ? min : x.cmp(max) > 0 ? max : new Ctor(x);
  };


  /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */
  P.comparedTo = P.cmp = function (y) {
    var i, j, xdL, ydL,
      x = this,
      xd = x.d,
      yd = (y = new x.constructor(y)).d,
      xs = x.s,
      ys = y.s;

    // Either NaN or ±Infinity?
    if (!xd || !yd) {
      return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    }

    // Either zero?
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;

    // Signs differ?
    if (xs !== ys) return xs;

    // Compare exponents.
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;

    xdL = xd.length;
    ydL = yd.length;

    // Compare digit by digit.
    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }

    // Compare lengths.
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };


  /*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */
  P.cosine = P.cos = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.d) return new Ctor(NaN);

    // cos(0) = cos(-0) = 1
    if (!x.d[0]) return new Ctor(1);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = cosine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
  };


  /*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */
  P.cubeRoot = P.cbrt = function () {
    var e, m, n, r, rep, s, sd, t, t3, t3plusx,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    external = false;

    // Initial estimate.
    s = x.s * mathpow(x.s * x, 1 / 3);

     // Math.cbrt underflow/overflow?
     // Pass x to Math.pow as integer, then adjust the exponent of the result.
    if (!s || Math.abs(s) == 1 / 0) {
      n = digitsToString(x.d);
      e = x.e;

      // Adjust n exponent so it is a multiple of 3 away from x exponent.
      if (s = (e - n.length + 1) % 3) n += (s == 1 || s == -2 ? '0' : '00');
      s = mathpow(n, 1 / 3);

      // Rarely, e may be one less than the result exponent value.
      e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
      r.s = x.s;
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Halley's method.
    // TODO? Compare Newton's method.
    for (;;) {
      t = r;
      t3 = t.times(t).times(t);
      t3plusx = t3.plus(x);
      r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
        // , i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */
  P.decimalPlaces = P.dp = function () {
    var w,
      d = this.d,
      n = NaN;

    if (d) {
      w = d.length - 1;
      n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last word.
      w = d[w];
      if (w) for (; w % 10 == 0; w /= 10) n--;
      if (n < 0) n = 0;
    }

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedBy = P.div = function (y) {
    return divide(this, new this.constructor(y));
  };


  /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedToIntegerBy = P.divToInt = function (y) {
    var x = this,
      Ctor = x.constructor;
    return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
  };


  /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */
  P.equals = P.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */
  P.floor = function () {
    return finalise(new this.constructor(this), this.e + 1, 3);
  };


  /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */
  P.greaterThan = P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */
  P.greaterThanOrEqualTo = P.gte = function (y) {
    var k = this.cmp(y);
    return k == 1 || k === 0;
  };


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */
  P.hyperbolicCosine = P.cosh = function () {
    var k, n, pr, rm, len,
      x = this,
      Ctor = x.constructor,
      one = new Ctor(1);

    if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
    if (x.isZero()) return one;

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
    // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))

    // Estimate the optimum number of times to use the argument reduction.
    // TODO? Estimation reused from cosine() and may not be optimal here.
    if (len < 32) {
      k = Math.ceil(len / 3);
      n = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      n = '2.3283064365386962890625e-10';
    }

    x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);

    // Reverse argument reduction
    var cosh2_x,
      i = k,
      d8 = new Ctor(8);
    for (; i--;) {
      cosh2_x = x.times(x);
      x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
    }

    return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */
  P.hyperbolicSine = P.sinh = function () {
    var k, pr, rm, len,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    if (len < 3) {
      x = taylorSeries(Ctor, 2, x, x, true);
    } else {

      // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
      // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
      // 3 multiplications and 1 addition

      // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
      // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
      // 4 multiplications and 2 additions

      // Estimate the optimum number of times to use the argument reduction.
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;

      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x, true);

      // Reverse argument reduction
      var sinh2_x,
        d5 = new Ctor(5),
        d16 = new Ctor(16),
        d20 = new Ctor(20);
      for (; k--;) {
        sinh2_x = x.times(x);
        x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
      }
    }

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */
  P.hyperbolicTangent = P.tanh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(x.s);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 7;
    Ctor.rounding = 1;

    return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
  };


  /*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */
  P.inverseCosine = P.acos = function () {
    var halfPi,
      x = this,
      Ctor = x.constructor,
      k = x.abs().cmp(1),
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (k !== -1) {
      return k === 0
        // |x| is 1
        ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0)
        // |x| > 1 or x is NaN
        : new Ctor(NaN);
    }

    if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);

    // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.asin();
    halfPi = getPi(Ctor, pr + 4, rm).times(0.5);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return halfPi.minus(x);
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */
  P.inverseHyperbolicCosine = P.acosh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
    if (!x.isFinite()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).minus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */
  P.inverseHyperbolicSine = P.asinh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).plus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */
  P.inverseHyperbolicTangent = P.atanh = function () {
    var pr, rm, wpr, xsd,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    xsd = x.sd();

    if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);

    Ctor.precision = wpr = xsd - x.e;

    x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);

    Ctor.precision = pr + 4;
    Ctor.rounding = 1;

    x = x.ln();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(0.5);
  };


  /*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */
  P.inverseSine = P.asin = function () {
    var halfPi, k,
      pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.isZero()) return new Ctor(x);

    k = x.abs().cmp(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (k !== -1) {

      // |x| is 1
      if (k === 0) {
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        halfPi.s = x.s;
        return halfPi;
      }

      // |x| > 1 or x is NaN
      return new Ctor(NaN);
    }

    // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(2);
  };


  /*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */
  P.inverseTangent = P.atan = function () {
    var i, j, k, n, px, t, r, wpr, x2,
      x = this,
      Ctor = x.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (!x.isFinite()) {
      if (!x.s) return new Ctor(NaN);
      if (pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.5);
        r.s = x.s;
        return r;
      }
    } else if (x.isZero()) {
      return new Ctor(x);
    } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.25);
      r.s = x.s;
      return r;
    }

    Ctor.precision = wpr = pr + 10;
    Ctor.rounding = 1;

    // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);

    // Argument reduction
    // Ensure |x| < 0.42
    // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))

    k = Math.min(28, wpr / LOG_BASE + 2 | 0);

    for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));

    external = false;

    j = Math.ceil(wpr / LOG_BASE);
    n = 1;
    x2 = x.times(x);
    r = new Ctor(x);
    px = x;

    // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    for (; i !== -1;) {
      px = px.times(x2);
      t = r.minus(px.div(n += 2));

      px = px.times(x2);
      r = t.plus(px.div(n += 2));

      if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--;);
    }

    if (k) r = r.times(2 << (k - 1));

    external = true;

    return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */
  P.isFinite = function () {
    return !!this.d;
  };


  /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */
  P.isInteger = P.isInt = function () {
    return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
  };


  /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */
  P.isNegative = P.isNeg = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */
  P.isPositive = P.isPos = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */
  P.isZero = function () {
    return !!this.d && this.d[0] === 0;
  };


  /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */
  P.lessThan = P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */
  P.lessThanOrEqualTo = P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */
  P.logarithm = P.log = function (base) {
    var isBase10, d, denominator, k, inf, num, sd, r,
      arg = this,
      Ctor = arg.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding,
      guard = 5;

    // Default base is 10.
    if (base == null) {
      base = new Ctor(10);
      isBase10 = true;
    } else {
      base = new Ctor(base);
      d = base.d;

      // Return NaN if base is negative, or non-finite, or is 0 or 1.
      if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);

      isBase10 = base.eq(10);
    }

    d = arg.d;

    // Is arg negative, non-finite, 0 or 1?
    if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
      return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
    }

    // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
    // integer power of 10.
    if (isBase10) {
      if (d.length > 1) {
        inf = true;
      } else {
        for (k = d[0]; k % 10 === 0;) k /= 10;
        inf = k !== 1;
      }
    }

    external = false;
    sd = pr + guard;
    num = naturalLogarithm(arg, sd);
    denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);

    // The result will have 5 rounding digits.
    r = divide(num, denominator, sd, 1);

    // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
    // calculate 10 further digits.
    //
    // If the result is known to have an infinite decimal expansion, repeat this until it is clear
    // that the result is above or below the boundary. Otherwise, if after calculating the 10
    // further digits, the last 14 are nines, round up and assume the result is exact.
    // Also assume the result is exact if the last 14 are zero.
    //
    // Example of a result that will be incorrectly rounded:
    // log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
    // The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
    // will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
    // the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
    // place is still 2.6.
    if (checkRoundingDigits(r.d, k = pr, rm)) {

      do {
        sd += 10;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);

        if (!inf) {

          // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
          if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }

          break;
        }
      } while (checkRoundingDigits(r.d, k += 10, rm));
    }

    external = true;

    return finalise(r, pr, rm);
  };


  /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */


  /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.minus = P.sub = function (y) {
    var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return y negated if x is finite and y is ±Infinity.
      else if (x.d) y.s = -y.s;

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with different signs.
      // Return NaN if both are ±Infinity with the same sign.
      else y = new Ctor(y.d || x.s !== y.s ? x : NaN);

      return y;
    }

    // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.plus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return y negated if x is zero and y is non-zero.
      if (yd[0]) y.s = -y.s;

      // Return x if y is zero and x is non-zero.
      else if (xd[0]) y = new Ctor(x);

      // Return zero if both are zero.
      // From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
      else return new Ctor(rm === 3 ? -0 : 0);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    e = mathfloor(y.e / LOG_BASE);
    xe = mathfloor(x.e / LOG_BASE);

    xd = xd.slice();
    k = xe - e;

    // If base 1e7 exponents differ...
    if (k) {
      xLTy = k < 0;

      if (xLTy) {
        d = xd;
        k = -k;
        len = yd.length;
      } else {
        d = yd;
        e = xe;
        len = xd.length;
      }

      // Numbers with massively different exponents would result in a very high number of
      // zeros needing to be prepended, but this can be avoided while still ensuring correct
      // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

      if (k > i) {
        k = i;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents.
      d.reverse();
      for (i = k; i--;) d.push(0);
      d.reverse();

    // Base 1e7 exponents equal.
    } else {

      // Check digits to determine which is the bigger number.

      i = xd.length;
      len = yd.length;
      xLTy = i < len;
      if (xLTy) len = i;

      for (i = 0; i < len; i++) {
        if (xd[i] != yd[i]) {
          xLTy = xd[i] < yd[i];
          break;
        }
      }

      k = 0;
    }

    if (xLTy) {
      d = xd;
      xd = yd;
      yd = d;
      y.s = -y.s;
    }

    len = xd.length;

    // Append zeros to `xd` if shorter.
    // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

    // Subtract yd from xd.
    for (i = yd.length; i > k;) {

      if (xd[--i] < yd[i]) {
        for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
        --xd[j];
        xd[i] += BASE;
      }

      xd[i] -= yd[i];
    }

    // Remove trailing zeros.
    for (; xd[--len] === 0;) xd.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xd[0] === 0; xd.shift()) --e;

    // Zero?
    if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */
  P.modulo = P.mod = function (y) {
    var q,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
    if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);

    // Return x if y is ±Infinity or x is ±0.
    if (!y.d || x.d && !x.d[0]) {
      return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
    }

    // Prevent rounding of intermediate calculations.
    external = false;

    if (Ctor.modulo == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // result = x - q * y    where  0 <= result < abs(y)
      q = divide(x, y.abs(), 0, 3, 1);
      q.s *= y.s;
    } else {
      q = divide(x, y, 0, Ctor.modulo, 1);
    }

    q = q.times(y);

    external = true;

    return x.minus(q);
  };


  /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.naturalExponential = P.exp = function () {
    return naturalExponential(this);
  };


  /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.naturalLogarithm = P.ln = function () {
    return naturalLogarithm(this);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */
  P.negated = P.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return finalise(x);
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.plus = P.add = function (y) {
    var carry, d, e, i, k, len, pr, rm, xd, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with the same sign.
      // Return NaN if both are ±Infinity with different signs.
      // Return y if x is finite and y is ±Infinity.
      else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);

      return y;
    }

     // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return x if y is zero.
      // Return y if y is non-zero.
      if (!yd[0]) y = new Ctor(x);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    k = mathfloor(x.e / LOG_BASE);
    e = mathfloor(y.e / LOG_BASE);

    xd = xd.slice();
    i = k - e;

    // If base 1e7 exponents differ...
    if (i) {

      if (i < 0) {
        d = xd;
        i = -i;
        len = yd.length;
      } else {
        d = yd;
        e = k;
        len = xd.length;
      }

      // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
      k = Math.ceil(pr / LOG_BASE);
      len = k > len ? k + 1 : len + 1;

      if (i > len) {
        i = len;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
      d.reverse();
      for (; i--;) d.push(0);
      d.reverse();
    }

    len = xd.length;
    i = yd.length;

    // If yd is longer than xd, swap xd and yd so xd points to the longer array.
    if (len - i < 0) {
      i = len;
      d = yd;
      yd = xd;
      xd = d;
    }

    // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
    for (carry = 0; i;) {
      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
      xd[i] %= BASE;
    }

    if (carry) {
      xd.unshift(carry);
      ++e;
    }

    // Remove trailing zeros.
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    for (len = xd.length; xd[--len] == 0;) xd.pop();

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */
  P.precision = P.sd = function (z) {
    var k,
      x = this;

    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

    if (x.d) {
      k = getPrecision(x.d);
      if (z && x.e + 1 > k) k = x.e + 1;
    } else {
      k = NaN;
    }

    return k;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */
  P.round = function () {
    var x = this,
      Ctor = x.constructor;

    return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
  };


  /*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */
  P.sine = P.sin = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = sine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, sd, r, rep, t,
      x = this,
      d = x.d,
      e = x.e,
      s = x.s,
      Ctor = x.constructor;

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !d || !d[0]) {
      return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
    }

    external = false;

    // Initial estimate.
    s = Math.sqrt(+x);

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = digitsToString(d);

      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(n);
      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Newton-Raphson iteration.
    for (;;) {
      t = r;
      r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
        // 4999, i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */
  P.tangent = P.tan = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 10;
    Ctor.rounding = 1;

    x = x.sin();
    x.s = 1;
    x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */
  P.times = P.mul = function (y) {
    var carry, e, i, k, r, rL, t, xdL, ydL,
      x = this,
      Ctor = x.constructor,
      xd = x.d,
      yd = (y = new Ctor(y)).d;

    y.s *= x.s;

     // If either is NaN, ±Infinity or ±0...
    if (!xd || !xd[0] || !yd || !yd[0]) {

      return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd

        // Return NaN if either is NaN.
        // Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
        ? NaN

        // Return ±Infinity if either is ±Infinity.
        // Return ±0 if either is ±0.
        : !xd || !yd ? y.s / 0 : y.s * 0);
    }

    e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
    xdL = xd.length;
    ydL = yd.length;

    // Ensure xd points to the longer array.
    if (xdL < ydL) {
      r = xd;
      xd = yd;
      yd = r;
      rL = xdL;
      xdL = ydL;
      ydL = rL;
    }

    // Initialise the result array with zeros.
    r = [];
    rL = xdL + ydL;
    for (i = rL; i--;) r.push(0);

    // Multiply!
    for (i = ydL; --i >= 0;) {
      carry = 0;
      for (k = xdL + i; k > i;) {
        t = r[k] + yd[i] * xd[k - i - 1] + carry;
        r[k--] = t % BASE | 0;
        carry = t / BASE | 0;
      }

      r[k] = (r[k] + carry) % BASE | 0;
    }

    // Remove trailing zeros.
    for (; !r[--rL];) r.pop();

    if (carry) ++e;
    else r.shift();

    y.d = r;
    y.e = getBase10Exponent(r, e);

    return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
  };


  /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toBinary = function (sd, rm) {
    return toStringBinary(this, 2, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toDecimalPlaces = P.toDP = function (dp, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);
    if (dp === void 0) return x;

    checkInt32(dp, 0, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    return finalise(x, dp + x.e + 1, rm);
  };


  /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toExponential = function (dp, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x, true);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), dp + 1, rm);
      str = finiteToString(x, true, dp + 1);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */
  P.toFixed = function (dp, rm) {
    var str, y,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      y = finalise(new Ctor(x), dp + x.e + 1, rm);
      str = finiteToString(y, false, dp + y.e + 1);
    }

    // To determine whether to add the minus sign look at the value before it was rounded,
    // i.e. look at `x` rather than `y`.
    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */
  P.toFraction = function (maxD) {
    var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r,
      x = this,
      xd = x.d,
      Ctor = x.constructor;

    if (!xd) return new Ctor(x);

    n1 = d0 = new Ctor(1);
    d1 = n0 = new Ctor(0);

    d = new Ctor(d1);
    e = d.e = getPrecision(xd) - x.e - 1;
    k = e % LOG_BASE;
    d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);

    if (maxD == null) {

      // d is 10**e, the minimum max-denominator needed.
      maxD = e > 0 ? d : n1;
    } else {
      n = new Ctor(maxD);
      if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
      maxD = n.gt(d) ? (e > 0 ? d : n1) : n;
    }

    external = false;
    n = new Ctor(digitsToString(xd));
    pr = Ctor.precision;
    Ctor.precision = e = xd.length * LOG_BASE * 2;

    for (;;)  {
      q = divide(n, d, 0, 1, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.cmp(maxD) == 1) break;
      d0 = d1;
      d1 = d2;
      d2 = n1;
      n1 = n0.plus(q.times(d2));
      n0 = d2;
      d2 = d;
      d = n.minus(q.times(d2));
      n = d2;
    }

    d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;

    // Determine which fraction is closer to x, n0/d0 or n1/d1?
    r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1
        ? [n1, d1] : [n0, d0];

    Ctor.precision = pr;
    external = true;

    return r;
  };


  /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toHexadecimal = P.toHex = function (sd, rm) {
    return toStringBinary(this, 16, sd, rm);
  };


  /*
   * Returns a new Decimal whose value is the nearest multiple of `y` in the direction of rounding
   * mode `rm`, or `Decimal.rounding` if `rm` is omitted, to the value of this Decimal.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */
  P.toNearest = function (y, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);

    if (y == null) {

      // If x is not finite, return x.
      if (!x.d) return x;

      y = new Ctor(1);
      rm = Ctor.rounding;
    } else {
      y = new Ctor(y);
      if (rm === void 0) {
        rm = Ctor.rounding;
      } else {
        checkInt32(rm, 0, 8);
      }

      // If x is not finite, return x if y is not NaN, else NaN.
      if (!x.d) return y.s ? x : y;

      // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
      if (!y.d) {
        if (y.s) y.s = x.s;
        return y;
      }
    }

    // If y is not zero, calculate the nearest multiple of y to x.
    if (y.d[0]) {
      external = false;
      x = divide(x, y, 0, rm, 1).times(y);
      external = true;
      finalise(x);

    // If y is zero, return zero with the sign of x.
    } else {
      y.s = x.s;
      x = y;
    }

    return x;
  };


  /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */
  P.toNumber = function () {
    return +this;
  };


  /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toOctal = function (sd, rm) {
    return toStringBinary(this, 8, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, ±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, ±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */
  P.toPower = P.pow = function (y) {
    var e, k, pr, r, rm, s,
      x = this,
      Ctor = x.constructor,
      yn = +(y = new Ctor(y));

    // Either ±Infinity, NaN or ±0?
    if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));

    x = new Ctor(x);

    if (x.eq(1)) return x;

    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (y.eq(1)) return finalise(x, pr, rm);

    // y exponent
    e = mathfloor(y.e / LOG_BASE);

    // If y is a small integer use the 'exponentiation by squaring' algorithm.
    if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
      r = intPow(Ctor, x, k, pr);
      return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
    }

    s = x.s;

    // if x is negative
    if (s < 0) {

      // if y is not an integer
      if (e < y.d.length - 1) return new Ctor(NaN);

      // Result is positive if x is negative and the last digit of integer y is even.
      if ((y.d[e] & 1) == 0) s = 1;

      // if x.eq(-1)
      if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
        x.s = s;
        return x;
      }
    }

    // Estimate result exponent.
    // x^y = 10^e,  where e = y * log10(x)
    // log10(x) = log10(x_significand) + x_exponent
    // log10(x_significand) = ln(x_significand) / ln(10)
    k = mathpow(+x, yn);
    e = k == 0 || !isFinite(k)
      ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1))
      : new Ctor(k + '').e;

    // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.

    // Overflow/underflow?
    if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);

    external = false;
    Ctor.rounding = x.s = 1;

    // Estimate the extra guard digits needed to ensure five correct rounding digits from
    // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
    // new Decimal(2.32456).pow('2087987436534566.46411')
    // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
    k = Math.min(12, (e + '').length);

    // r = x^y = exp(y*ln(x))
    r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);

    // r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
    if (r.d) {

      // Truncate to the required precision plus five rounding digits.
      r = finalise(r, pr + 5, 1);

      // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
      // the result.
      if (checkRoundingDigits(r.d, pr, rm)) {
        e = pr + 10;

        // Truncate to the increased precision plus five rounding digits.
        r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);

        // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
        if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
      }
    }

    r.s = s;
    external = true;
    Ctor.rounding = rm;

    return finalise(r, pr, rm);
  };


  /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toPrecision = function (sd, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), sd, rm);
      str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */
  P.toSignificantDigits = P.toSD = function (sd, rm) {
    var x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    }

    return finalise(new Ctor(x), sd, rm);
  };


  /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */
  P.toString = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */
  P.truncated = P.trunc = function () {
    return finalise(new this.constructor(this), this.e + 1, 1);
  };


  /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */
  P.valueOf = P.toJSON = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() ? '-' + str : str;
  };


  // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


  /*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
   *                           finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              toStringBinary, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, parseOther, random, Decimal
   */


  function digitsToString(d) {
    var i, k, ws,
      indexOfLastWord = d.length - 1,
      str = '',
      w = d[0];

    if (indexOfLastWord > 0) {
      str += w;
      for (i = 1; i < indexOfLastWord; i++) {
        ws = d[i] + '';
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
        str += ws;
      }

      w = d[i];
      ws = w + '';
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
    } else if (w === 0) {
      return '0';
    }

    // Remove trailing zeros of last w.
    for (; w % 10 === 0;) w /= 10;

    return str + w;
  }


  function checkInt32(i, min, max) {
    if (i !== ~~i || i < min || i > max) {
      throw Error(invalidArgument + i);
    }
  }


  /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */
  function checkRoundingDigits(d, i, rm, repeating) {
    var di, k, r, rd;

    // Get the length of the first word of the array d.
    for (k = d[0]; k >= 10; k /= 10) --i;

    // Is the rounding digit in the first word of d?
    if (--i < 0) {
      i += LOG_BASE;
      di = 0;
    } else {
      di = Math.ceil((i + 1) / LOG_BASE);
      i %= LOG_BASE;
    }

    // i is the index (0 - 6) of the rounding digit.
    // E.g. if within the word 3487563 the first rounding digit is 5,
    // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
    k = mathpow(10, LOG_BASE - i);
    rd = d[di] % k | 0;

    if (repeating == null) {
      if (i < 3) {
        if (i == 0) rd = rd / 100 | 0;
        else if (i == 1) rd = rd / 10 | 0;
        r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
      } else {
        r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) &&
          (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 ||
            (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
      }
    } else {
      if (i < 4) {
        if (i == 0) rd = rd / 1000 | 0;
        else if (i == 1) rd = rd / 100 | 0;
        else if (i == 2) rd = rd / 10 | 0;
        r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
      } else {
        r = ((repeating || rm < 4) && rd + 1 == k ||
        (!repeating && rm > 3) && rd + 1 == k / 2) &&
          (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
      }
    }

    return r;
  }


  // Convert string of `baseIn` to an array of numbers of `baseOut`.
  // Eg. convertBase('255', 10, 16) returns [15, 15].
  // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
  function convertBase(str, baseIn, baseOut) {
    var j,
      arr = [0],
      arrL,
      i = 0,
      strL = str.length;

    for (; i < strL;) {
      for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
      arr[0] += NUMERALS.indexOf(str.charAt(i++));
      for (j = 0; j < arr.length; j++) {
        if (arr[j] > baseOut - 1) {
          if (arr[j + 1] === void 0) arr[j + 1] = 0;
          arr[j + 1] += arr[j] / baseOut | 0;
          arr[j] %= baseOut;
        }
      }
    }

    return arr.reverse();
  }


  /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */
  function cosine(Ctor, x) {
    var k, len, y;

    if (x.isZero()) return x;

    // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
    // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1

    // Estimate the optimum number of times to use the argument reduction.
    len = x.d.length;
    if (len < 32) {
      k = Math.ceil(len / 3);
      y = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      y = '2.3283064365386962890625e-10';
    }

    Ctor.precision += k;

    x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));

    // Reverse argument reduction
    for (var i = k; i--;) {
      var cos2x = x.times(x);
      x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
    }

    Ctor.precision -= k;

    return x;
  }


  /*
   * Perform division in the specified base.
   */
  var divide = (function () {

    // Assumes non-zero x and k, and hence non-zero result.
    function multiplyInteger(x, k, base) {
      var temp,
        carry = 0,
        i = x.length;

      for (x = x.slice(); i--;) {
        temp = x[i] * k + carry;
        x[i] = temp % base | 0;
        carry = temp / base | 0;
      }

      if (carry) x.unshift(carry);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, r;

      if (aL != bL) {
        r = aL > bL ? 1 : -1;
      } else {
        for (i = r = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            r = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return r;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1;) a.shift();
    }

    return function (x, y, pr, rm, dp, base) {
      var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0,
        yL, yz,
        Ctor = x.constructor,
        sign = x.s == y.s ? 1 : -1,
        xd = x.d,
        yd = y.d;

      // Either NaN, Infinity or 0?
      if (!xd || !xd[0] || !yd || !yd[0]) {

        return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN :

          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
      }

      if (base) {
        logBase = 1;
        e = x.e - y.e;
      } else {
        base = BASE;
        logBase = LOG_BASE;
        e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
      }

      yL = yd.length;
      xL = xd.length;
      q = new Ctor(sign);
      qd = q.d = [];

      // Result exponent may be one less than e.
      // The digit array of a Decimal from toStringBinary may have trailing zeros.
      for (i = 0; yd[i] == (xd[i] || 0); i++);

      if (yd[i] > (xd[i] || 0)) e--;

      if (pr == null) {
        sd = pr = Ctor.precision;
        rm = Ctor.rounding;
      } else if (dp) {
        sd = pr + (x.e - y.e) + 1;
      } else {
        sd = pr;
      }

      if (sd < 0) {
        qd.push(1);
        more = true;
      } else {

        // Convert precision in number of base 10 digits to base 1e7 digits.
        sd = sd / logBase + 2 | 0;
        i = 0;

        // divisor < 1e7
        if (yL == 1) {
          k = 0;
          yd = yd[0];
          sd++;

          // k is the carry.
          for (; (i < xL || k) && sd--; i++) {
            t = k * base + (xd[i] || 0);
            qd[i] = t / yd | 0;
            k = t % yd | 0;
          }

          more = k || i < xL;

        // divisor >= 1e7
        } else {

          // Normalise xd and yd so highest order digit of yd is >= base/2
          k = base / (yd[0] + 1) | 0;

          if (k > 1) {
            yd = multiplyInteger(yd, k, base);
            xd = multiplyInteger(xd, k, base);
            yL = yd.length;
            xL = xd.length;
          }

          xi = yL;
          rem = xd.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL;) rem[remL++] = 0;

          yz = yd.slice();
          yz.unshift(0);
          yd0 = yd[0];

          if (yd[1] >= base / 2) ++yd0;

          do {
            k = 0;

            // Compare divisor and remainder.
            cmp = compare(yd, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, k.
              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // k will be how many times the divisor goes into the current remainder.
              k = rem0 / yd0 | 0;

              //  Algorithm:
              //  1. product = divisor * trial digit (k)
              //  2. if product > remainder: product -= divisor, k--
              //  3. remainder -= product
              //  4. if product was < remainder at 2:
              //    5. compare new remainder and divisor
              //    6. If remainder > divisor: remainder -= divisor, k++

              if (k > 1) {
                if (k >= base) k = base - 1;

                // product = divisor * trial digit.
                prod = multiplyInteger(yd, k, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                cmp = compare(prod, rem, prodL, remL);

                // product > remainder.
                if (cmp == 1) {
                  k--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yd, prodL, base);
                }
              } else {

                // cmp is -1.
                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                if (k == 0) cmp = k = 1;
                prod = yd.slice();
              }

              prodL = prod.length;
              if (prodL < remL) prod.unshift(0);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);

              // If product was < previous remainder.
              if (cmp == -1) {
                remL = rem.length;

                // Compare divisor and new remainder.
                cmp = compare(yd, rem, yL, remL);

                // If divisor < new remainder, subtract divisor from remainder.
                if (cmp < 1) {
                  k++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yd, remL, base);
                }
              }

              remL = rem.length;
            } else if (cmp === 0) {
              k++;
              rem = [0];
            }    // if cmp === 1, k will be 0

            // Add the next digit, k, to the result array.
            qd[i++] = k;

            // Update the remainder.
            if (cmp && rem[0]) {
              rem[remL++] = xd[xi] || 0;
            } else {
              rem = [xd[xi]];
              remL = 1;
            }

          } while ((xi++ < xL || rem[0] !== void 0) && sd--);

          more = rem[0] !== void 0;
        }

        // Leading zero?
        if (!qd[0]) qd.shift();
      }

      // logBase is 1 when divide is being used for base conversion.
      if (logBase == 1) {
        q.e = e;
        inexact = more;
      } else {

        // To calculate q.e, first get the number of digits of qd[0].
        for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
        q.e = i + e * logBase - 1;

        finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
      }

      return q;
    };
  })();


  /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */
   function finalise(x, sd, rm, isTruncated) {
    var digits, i, j, k, rd, roundUp, w, xd, xdi,
      Ctor = x.constructor;

    // Don't round if sd is null or undefined.
    out: if (sd != null) {
      xd = x.d;

      // Infinity/NaN.
      if (!xd) return x;

      // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
      // w: the word of xd containing rd, a base 1e7 number.
      // xdi: the index of w within xd.
      // digits: the number of digits of w.
      // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
      // they had leading zeros)
      // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

      // Get the length of the first word of the digits array xd.
      for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
      i = sd - digits;

      // Is the rounding digit in the first word of xd?
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];

        // Get the rounding digit at index j of w.
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {

            // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
            for (; k++ <= xdi;) xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];

          // Get the number of digits of w.
          for (digits = 1; k >= 10; k /= 10) digits++;

          // Get the index of rd within w.
          i %= LOG_BASE;

          // Get the index of rd within w, adjusted for leading zeros.
          // The number of leading zeros of w is given by LOG_BASE - digits.
          j = i - LOG_BASE + digits;

          // Get the rounding digit at index j of w.
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }

      // Are there any non-zero digits after the rounding digit?
      isTruncated = isTruncated || sd < 0 ||
        xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));

      // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
      // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
      // will give 714.

      roundUp = rm < 4
        ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
        : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
            rm == (x.s < 0 ? 8 : 7));

      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {

          // Convert sd to decimal places.
          sd -= x.e + 1;

          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {

          // Zero.
          xd[0] = x.e = 0;
        }

        return x;
      }

      // Remove excess digits.
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);

        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
        // j > 0 means i > number of leading zeros of w.
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }

      if (roundUp) {
        for (;;) {

          // Is the digit to be rounded up in the first word of xd?
          if (xdi == 0) {

            // i will be the length of xd[0] before k is added.
            for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10) k++;

            // if i != k the length has increased.
            if (i != k) {
              x.e++;
              if (xd[0] == BASE) xd[0] = 1;
            }

            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE) break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }

      // Remove trailing zeros.
      for (i = xd.length; xd[--i] === 0;) xd.pop();
    }

    if (external) {

      // Overflow?
      if (x.e > Ctor.maxE) {

        // Infinity.
        x.d = null;
        x.e = NaN;

      // Underflow?
      } else if (x.e < Ctor.minE) {

        // Zero.
        x.e = 0;
        x.d = [0];
        // Ctor.underflow = true;
      } // else Ctor.underflow = false;
    }

    return x;
  }


  function finiteToString(x, isExp, sd) {
    if (!x.isFinite()) return nonFiniteToString(x);
    var k,
      e = x.e,
      str = digitsToString(x.d),
      len = str.length;

    if (isExp) {
      if (sd && (k = sd - len) > 0) {
        str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
      } else if (len > 1) {
        str = str.charAt(0) + '.' + str.slice(1);
      }

      str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
    } else if (e < 0) {
      str = '0.' + getZeroString(-e - 1) + str;
      if (sd && (k = sd - len) > 0) str += getZeroString(k);
    } else if (e >= len) {
      str += getZeroString(e + 1 - len);
      if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
    } else {
      if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
      if (sd && (k = sd - len) > 0) {
        if (e + 1 === len) str += '.';
        str += getZeroString(k);
      }
    }

    return str;
  }


  // Calculate the base 10 exponent from the base 1e7 exponent.
  function getBase10Exponent(digits, e) {
    var w = digits[0];

    // Add the number of digits of the first word of the digits array.
    for ( e *= LOG_BASE; w >= 10; w /= 10) e++;
    return e;
  }


  function getLn10(Ctor, sd, pr) {
    if (sd > LN10_PRECISION) {

      // Reset global state in case the exception is caught.
      external = true;
      if (pr) Ctor.precision = pr;
      throw Error(precisionLimitExceeded);
    }
    return finalise(new Ctor(LN10), sd, 1, true);
  }


  function getPi(Ctor, sd, rm) {
    if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
    return finalise(new Ctor(PI), sd, rm, true);
  }


  function getPrecision(digits) {
    var w = digits.length - 1,
      len = w * LOG_BASE + 1;

    w = digits[w];

    // If non-zero...
    if (w) {

      // Subtract the number of trailing zeros of the last word.
      for (; w % 10 == 0; w /= 10) len--;

      // Add the number of digits of the first word.
      for (w = digits[0]; w >= 10; w /= 10) len++;
    }

    return len;
  }


  function getZeroString(k) {
    var zs = '';
    for (; k--;) zs += '0';
    return zs;
  }


  /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */
  function intPow(Ctor, x, n, pr) {
    var isTruncated,
      r = new Ctor(1),

      // Max n of 9007199254740991 takes 53 loop iterations.
      // Maximum digits array length; leaves [28, 34] guard digits.
      k = Math.ceil(pr / LOG_BASE + 4);

    external = false;

    for (;;) {
      if (n % 2) {
        r = r.times(x);
        if (truncate(r.d, k)) isTruncated = true;
      }

      n = mathfloor(n / 2);
      if (n === 0) {

        // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
        n = r.d.length - 1;
        if (isTruncated && r.d[n] === 0) ++r.d[n];
        break;
      }

      x = x.times(x);
      truncate(x.d, k);
    }

    external = true;

    return r;
  }


  function isOdd(n) {
    return n.d[n.d.length - 1] & 1;
  }


  /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */
  function maxOrMin(Ctor, args, ltgt) {
    var y,
      x = new Ctor(args[0]),
      i = 0;

    for (; ++i < args.length;) {
      y = new Ctor(args[i]);
      if (!y.s) {
        x = y;
        break;
      } else if (x[ltgt](y)) {
        x = y;
      }
    }

    return x;
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */
  function naturalExponential(x, sd) {
    var denominator, guard, j, pow, sum, t, wpr,
      rep = 0,
      i = 0,
      k = 0,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // 0/NaN/Infinity?
    if (!x.d || !x.d[0] || x.e > 17) {

      return new Ctor(x.d
        ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0
        : x.s ? x.s < 0 ? 0 : x : 0 / 0);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    t = new Ctor(0.03125);

    // while abs(x) >= 0.1
    while (x.e > -2) {

      // x = x / 2^5
      x = x.times(t);
      k += 5;
    }

    // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
    // necessary to ensure the first 4 rounding digits are correct.
    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
    wpr += guard;
    denominator = pow = sum = new Ctor(1);
    Ctor.precision = wpr;

    for (;;) {
      pow = finalise(pow.times(x), wpr, 1);
      denominator = denominator.times(++i);
      t = sum.plus(divide(pow, denominator, wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        j = k;
        while (j--) sum = finalise(sum.times(sum), wpr, 1);

        // Check to see if the first 4 rounding digits are [49]999.
        // If so, repeat the summation with a higher precision, otherwise
        // e.g. with precision: 18, rounding: 1
        // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {

          if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += 10;
            denominator = pow = t = new Ctor(1);
            i = 0;
            rep++;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
    }
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */
  function naturalLogarithm(y, sd) {
    var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2,
      n = 1,
      guard = 10,
      x = y,
      xd = x.d,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // Is x negative or Infinity, NaN, 0 or 1?
    if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
      return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    Ctor.precision = wpr += guard;
    c = digitsToString(xd);
    c0 = c.charAt(0);

    if (Math.abs(e = x.e) < 1.5e15) {

      // Argument reduction.
      // The series converges faster the closer the argument is to 1, so using
      // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
      // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
      // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
      // later be divided by this number, then separate out the power of 10 using
      // ln(a*10^b) = ln(a) + b*ln(10).

      // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
      //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
      // max n is 6 (gives 0.7 - 1.3)
      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
        x = x.times(y);
        c = digitsToString(x.d);
        c0 = c.charAt(0);
        n++;
      }

      e = x.e;

      if (c0 > 1) {
        x = new Ctor('0.' + c);
        e++;
      } else {
        x = new Ctor(c0 + '.' + c.slice(1));
      }
    } else {

      // The argument reduction method above may result in overflow if the argument y is a massive
      // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
      // function using ln(x*10^e) = ln(x) + e*ln(10).
      t = getLn10(Ctor, wpr + 2, pr).times(e + '');
      x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
      Ctor.precision = pr;

      return sd == null ? finalise(x, pr, rm, external = true) : x;
    }

    // x1 is x reduced to a value near 1.
    x1 = x;

    // Taylor series.
    // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
    // where x = (y - 1)/(y + 1)    (|x| < 1)
    sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
    x2 = finalise(x.times(x), wpr, 1);
    denominator = 3;

    for (;;) {
      numerator = finalise(numerator.times(x2), wpr, 1);
      t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        sum = sum.times(2);

        // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
        // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
        if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
        sum = divide(sum, new Ctor(n), wpr, 1);

        // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
        // been repeated previously) and the first 4 rounding digits 9999?
        // If so, restart the summation with a higher precision, otherwise
        // e.g. with precision: 12, rounding: 1
        // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {
          if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += guard;
            t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
            x2 = finalise(x.times(x), wpr, 1);
            denominator = rep = 1;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
      denominator += 2;
    }
  }


  // ±Infinity, NaN.
  function nonFiniteToString(x) {
    // Unsigned.
    return String(x.s * x.s / 0);
  }


  /*
   * Parse the value of a new Decimal `x` from string `str`.
   */
  function parseDecimal(x, str) {
    var e, i, len;

    // Decimal point?
    if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

    // Exponential form?
    if ((i = str.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
    str = str.slice(i, len);

    if (str) {
      len -= i;
      x.e = e = e - i - 1;
      x.d = [];

      // Transform base

      // e is the base 10 exponent.
      // i is where to slice str to get the first word of the digits array.
      i = (e + 1) % LOG_BASE;
      if (e < 0) i += LOG_BASE;

      if (i < len) {
        if (i) x.d.push(+str.slice(0, i));
        for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
        str = str.slice(i);
        i = LOG_BASE - str.length;
      } else {
        i -= len;
      }

      for (; i--;) str += '0';
      x.d.push(+str);

      if (external) {

        // Overflow?
        if (x.e > x.constructor.maxE) {

          // Infinity.
          x.d = null;
          x.e = NaN;

        // Underflow?
        } else if (x.e < x.constructor.minE) {

          // Zero.
          x.e = 0;
          x.d = [0];
          // x.constructor.underflow = true;
        } // else x.constructor.underflow = false;
      }
    } else {

      // Zero.
      x.e = 0;
      x.d = [0];
    }

    return x;
  }


  /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */
  function parseOther(x, str) {
    var base, Ctor, divisor, i, isFloat, len, p, xd, xe;

    if (str.indexOf('_') > -1) {
      str = str.replace(/(\d)_(?=\d)/g, '$1');
      if (isDecimal.test(str)) return parseDecimal(x, str);
    } else if (str === 'Infinity' || str === 'NaN') {
      if (!+str) x.s = NaN;
      x.e = NaN;
      x.d = null;
      return x;
    }

    if (isHex.test(str))  {
      base = 16;
      str = str.toLowerCase();
    } else if (isBinary.test(str))  {
      base = 2;
    } else if (isOctal.test(str))  {
      base = 8;
    } else {
      throw Error(invalidArgument + str);
    }

    // Is there a binary exponent part?
    i = str.search(/p/i);

    if (i > 0) {
      p = +str.slice(i + 1);
      str = str.substring(2, i);
    } else {
      str = str.slice(2);
    }

    // Convert `str` as an integer then divide the result by `base` raised to a power such that the
    // fraction part will be restored.
    i = str.indexOf('.');
    isFloat = i >= 0;
    Ctor = x.constructor;

    if (isFloat) {
      str = str.replace('.', '');
      len = str.length;
      i = len - i;

      // log[10](16) = 1.2041... , log[10](88) = 1.9444....
      divisor = intPow(Ctor, new Ctor(base), i, i * 2);
    }

    xd = convertBase(str, base, BASE);
    xe = xd.length - 1;

    // Remove trailing zeros.
    for (i = xe; xd[i] === 0; --i) xd.pop();
    if (i < 0) return new Ctor(x.s * 0);
    x.e = getBase10Exponent(xd, xe);
    x.d = xd;
    external = false;

    // At what precision to perform the division to ensure exact conversion?
    // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
    // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
    // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
    // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
    // Therefore using 4 * the number of digits of str will always be enough.
    if (isFloat) x = divide(x, divisor, len * 4);

    // Multiply by the binary exponent part if present.
    if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
    external = true;

    return x;
  }


  /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */
  function sine(Ctor, x) {
    var k,
      len = x.d.length;

    if (len < 3) {
      return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
    }

    // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
    // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
    // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))

    // Estimate the optimum number of times to use the argument reduction.
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;

    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x);

    // Reverse argument reduction
    var sin2_x,
      d5 = new Ctor(5),
      d16 = new Ctor(16),
      d20 = new Ctor(20);
    for (; k--;) {
      sin2_x = x.times(x);
      x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
    }

    return x;
  }


  // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
  function taylorSeries(Ctor, n, x, y, isHyperbolic) {
    var j, t, u, x2,
      i = 1,
      pr = Ctor.precision,
      k = Math.ceil(pr / LOG_BASE);

    external = false;
    x2 = x.times(x);
    u = new Ctor(y);

    for (;;) {
      t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
      u = isHyperbolic ? y.plus(t) : y.minus(t);
      y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
      t = u.plus(y);

      if (t.d[k] !== void 0) {
        for (j = k; t.d[j] === u.d[j] && j--;);
        if (j == -1) break;
      }

      j = u;
      u = y;
      y = t;
      t = j;
      i++;
    }

    external = true;
    t.d.length = k + 1;

    return t;
  }


  // Exponent e must be positive and non-zero.
  function tinyPow(b, e) {
    var n = b;
    while (--e) n *= b;
    return n;
  }


  // Return the absolute value of `x` reduced to less than or equal to half pi.
  function toLessThanHalfPi(Ctor, x) {
    var t,
      isNeg = x.s < 0,
      pi = getPi(Ctor, Ctor.precision, 1),
      halfPi = pi.times(0.5);

    x = x.abs();

    if (x.lte(halfPi)) {
      quadrant = isNeg ? 4 : 1;
      return x;
    }

    t = x.divToInt(pi);

    if (t.isZero()) {
      quadrant = isNeg ? 3 : 2;
    } else {
      x = x.minus(t.times(pi));

      // 0 <= x < pi
      if (x.lte(halfPi)) {
        quadrant = isOdd(t) ? (isNeg ? 2 : 3) : (isNeg ? 4 : 1);
        return x;
      }

      quadrant = isOdd(t) ? (isNeg ? 1 : 4) : (isNeg ? 3 : 2);
    }

    return x.minus(pi).abs();
  }


  /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */
  function toStringBinary(x, baseOut, sd, rm) {
    var base, e, i, k, len, roundUp, str, xd, y,
      Ctor = x.constructor,
      isExp = sd !== void 0;

    if (isExp) {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    } else {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    }

    if (!x.isFinite()) {
      str = nonFiniteToString(x);
    } else {
      str = finiteToString(x);
      i = str.indexOf('.');

      // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
      // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
      // minBinaryExponent = floor(decimalExponent * log[2](10))
      // log[2](10) = 3.321928094887362347870319429489390175864

      if (isExp) {
        base = 2;
        if (baseOut == 16) {
          sd = sd * 4 - 3;
        } else if (baseOut == 8) {
          sd = sd * 3 - 2;
        }
      } else {
        base = baseOut;
      }

      // Convert the number as an integer then divide the result by its base raised to a power such
      // that the fraction part will be restored.

      // Non-integer.
      if (i >= 0) {
        str = str.replace('.', '');
        y = new Ctor(1);
        y.e = str.length - i;
        y.d = convertBase(finiteToString(y), 10, base);
        y.e = y.d.length;
      }

      xd = convertBase(str, 10, base);
      e = len = xd.length;

      // Remove trailing zeros.
      for (; xd[--len] == 0;) xd.pop();

      if (!xd[0]) {
        str = isExp ? '0p+0' : '0';
      } else {
        if (i < 0) {
          e--;
        } else {
          x = new Ctor(x);
          x.d = xd;
          x.e = e;
          x = divide(x, y, sd, rm, 0, base);
          xd = x.d;
          e = x.e;
          roundUp = inexact;
        }

        // The rounding digit, i.e. the digit after the digit that may be rounded up.
        i = xd[sd];
        k = base / 2;
        roundUp = roundUp || xd[sd + 1] !== void 0;

        roundUp = rm < 4
          ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2))
          : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 ||
            rm === (x.s < 0 ? 8 : 7));

        xd.length = sd;

        if (roundUp) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (; ++xd[--sd] > base - 1;) {
            xd[sd] = 0;
            if (!sd) {
              ++e;
              xd.unshift(1);
            }
          }
        }

        // Determine trailing zeros.
        for (len = xd.length; !xd[len - 1]; --len);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i < len; i++) str += NUMERALS.charAt(xd[i]);

        // Add binary exponent suffix?
        if (isExp) {
          if (len > 1) {
            if (baseOut == 16 || baseOut == 8) {
              i = baseOut == 16 ? 4 : 3;
              for (--len; len % i; len++) str += '0';
              xd = convertBase(str, base, baseOut);
              for (len = xd.length; !xd[len - 1]; --len);

              // xd[0] will always be be 1
              for (i = 1, str = '1.'; i < len; i++) str += NUMERALS.charAt(xd[i]);
            } else {
              str = str.charAt(0) + '.' + str.slice(1);
            }
          }

          str =  str + (e < 0 ? 'p' : 'p+') + e;
        } else if (e < 0) {
          for (; ++e;) str = '0' + str;
          str = '0.' + str;
        } else {
          if (++e > len) for (e -= len; e-- ;) str += '0';
          else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
        }
      }

      str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
    }

    return x.s < 0 ? '-' + str : str;
  }


  // Does not strip trailing zeros.
  function truncate(arr, len) {
    if (arr.length > len) {
      arr.length = len;
      return true;
    }
  }


  // Decimal methods


  /*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clamp
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  set
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  sum
   *  tan
   *  tanh
   *  trunc
   */


  /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function abs(x) {
    return new this(x).abs();
  }


  /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function acos(x) {
    return new this(x).acos();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function acosh(x) {
    return new this(x).acosh();
  }


  /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function add(x, y) {
    return new this(x).plus(y);
  }


  /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function asin(x) {
    return new this(x).asin();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function asinh(x) {
    return new this(x).asinh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function atan(x) {
    return new this(x).atan();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function atanh(x) {
    return new this(x).atanh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(±0, -0)               = ±pi
   * atan2(±0, +0)               = ±0
   * atan2(±0, -x)               = ±pi for x > 0
   * atan2(±0, x)                = ±0 for x > 0
   * atan2(-y, ±0)               = -pi/2 for y > 0
   * atan2(y, ±0)                = pi/2 for y > 0
   * atan2(±y, -Infinity)        = ±pi for finite y > 0
   * atan2(±y, +Infinity)        = ±0 for finite y > 0
   * atan2(±Infinity, x)         = ±pi/2 for finite x
   * atan2(±Infinity, -Infinity) = ±3*pi/4
   * atan2(±Infinity, +Infinity) = ±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */
  function atan2(y, x) {
    y = new this(y);
    x = new this(x);
    var r,
      pr = this.precision,
      rm = this.rounding,
      wpr = pr + 4;

    // Either NaN
    if (!y.s || !x.s) {
      r = new this(NaN);

    // Both ±Infinity
    } else if (!y.d && !x.d) {
      r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
      r.s = y.s;

    // x is ±Infinity or y is ±0
    } else if (!x.d || y.isZero()) {
      r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
      r.s = y.s;

    // y is ±Infinity or x is ±0
    } else if (!y.d || x.isZero()) {
      r = getPi(this, wpr, 1).times(0.5);
      r.s = y.s;

    // Both non-zero and finite
    } else if (x.s < 0) {
      this.precision = wpr;
      this.rounding = 1;
      r = this.atan(divide(y, x, wpr, 1));
      x = getPi(this, wpr, 1);
      this.precision = pr;
      this.rounding = rm;
      r = y.s < 0 ? r.minus(x) : r.plus(x);
    } else {
      r = this.atan(divide(y, x, wpr, 1));
    }

    return r;
  }


  /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function cbrt(x) {
    return new this(x).cbrt();
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */
  function ceil(x) {
    return finalise(x = new this(x), x.e + 1, 2);
  }


  /*
   * Return a new Decimal whose value is `x` clamped to the range delineated by `min` and `max`.
   *
   * x {number|string|Decimal}
   * min {number|string|Decimal}
   * max {number|string|Decimal}
   *
   */
  function clamp(x, min, max) {
    return new this(x).clamp(min, max);
  }


  /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number}
   *   defaults   {true}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */
  function config(obj) {
    if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
    var i, p, v,
      useDefaults = obj.defaults === true,
      ps = [
        'precision', 1, MAX_DIGITS,
        'rounding', 0, 8,
        'toExpNeg', -EXP_LIMIT, 0,
        'toExpPos', 0, EXP_LIMIT,
        'maxE', 0, EXP_LIMIT,
        'minE', -EXP_LIMIT, 0,
        'modulo', 0, 9
      ];

    for (i = 0; i < ps.length; i += 3) {
      if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
      if ((v = obj[p]) !== void 0) {
        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }

    if (p = 'crypto', useDefaults) this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (v === true || v === false || v === 0 || v === 1) {
        if (v) {
          if (typeof crypto != 'undefined' && crypto &&
            (crypto.getRandomValues || crypto.randomBytes)) {
            this[p] = true;
          } else {
            throw Error(cryptoUnavailable);
          }
        } else {
          this[p] = false;
        }
      } else {
        throw Error(invalidArgument + p + ': ' + v);
      }
    }

    return this;
  }


  /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cos(x) {
    return new this(x).cos();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cosh(x) {
    return new this(x).cosh();
  }


  /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */
  function clone(obj) {
    var i, p, ps;

    /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */
    function Decimal(v) {
      var e, i, t,
        x = this;

      // Decimal called without new.
      if (!(x instanceof Decimal)) return new Decimal(v);

      // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
      // which points to Object.
      x.constructor = Decimal;

      // Duplicate.
      if (isDecimalInstance(v)) {
        x.s = v.s;

        if (external) {
          if (!v.d || v.e > Decimal.maxE) {

            // Infinity.
            x.e = NaN;
            x.d = null;
          } else if (v.e < Decimal.minE) {

            // Zero.
            x.e = 0;
            x.d = [0];
          } else {
            x.e = v.e;
            x.d = v.d.slice();
          }
        } else {
          x.e = v.e;
          x.d = v.d ? v.d.slice() : v.d;
        }

        return;
      }

      t = typeof v;

      if (t === 'number') {
        if (v === 0) {
          x.s = 1 / v < 0 ? -1 : 1;
          x.e = 0;
          x.d = [0];
          return;
        }

        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }

        // Fast path for small integers.
        if (v === ~~v && v < 1e7) {
          for (e = 0, i = v; i >= 10; i /= 10) e++;

          if (external) {
            if (e > Decimal.maxE) {
              x.e = NaN;
              x.d = null;
            } else if (e < Decimal.minE) {
              x.e = 0;
              x.d = [0];
            } else {
              x.e = e;
              x.d = [v];
            }
          } else {
            x.e = e;
            x.d = [v];
          }

          return;

        // Infinity, NaN.
        } else if (v * 0 !== 0) {
          if (!v) x.s = NaN;
          x.e = NaN;
          x.d = null;
          return;
        }

        return parseDecimal(x, v.toString());

      } else if (t !== 'string') {
        throw Error(invalidArgument + v);
      }

      // Minus sign?
      if ((i = v.charCodeAt(0)) === 45) {
        v = v.slice(1);
        x.s = -1;
      } else {
        // Plus sign?
        if (i === 43) v = v.slice(1);
        x.s = 1;
      }

      return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
    }

    Decimal.prototype = P;

    Decimal.ROUND_UP = 0;
    Decimal.ROUND_DOWN = 1;
    Decimal.ROUND_CEIL = 2;
    Decimal.ROUND_FLOOR = 3;
    Decimal.ROUND_HALF_UP = 4;
    Decimal.ROUND_HALF_DOWN = 5;
    Decimal.ROUND_HALF_EVEN = 6;
    Decimal.ROUND_HALF_CEIL = 7;
    Decimal.ROUND_HALF_FLOOR = 8;
    Decimal.EUCLID = 9;

    Decimal.config = Decimal.set = config;
    Decimal.clone = clone;
    Decimal.isDecimal = isDecimalInstance;

    Decimal.abs = abs;
    Decimal.acos = acos;
    Decimal.acosh = acosh;        // ES6
    Decimal.add = add;
    Decimal.asin = asin;
    Decimal.asinh = asinh;        // ES6
    Decimal.atan = atan;
    Decimal.atanh = atanh;        // ES6
    Decimal.atan2 = atan2;
    Decimal.cbrt = cbrt;          // ES6
    Decimal.ceil = ceil;
    Decimal.clamp = clamp;
    Decimal.cos = cos;
    Decimal.cosh = cosh;          // ES6
    Decimal.div = div;
    Decimal.exp = exp;
    Decimal.floor = floor;
    Decimal.hypot = hypot;        // ES6
    Decimal.ln = ln;
    Decimal.log = log;
    Decimal.log10 = log10;        // ES6
    Decimal.log2 = log2;          // ES6
    Decimal.max = max;
    Decimal.min = min;
    Decimal.mod = mod;
    Decimal.mul = mul;
    Decimal.pow = pow;
    Decimal.random = random;
    Decimal.round = round;
    Decimal.sign = sign;          // ES6
    Decimal.sin = sin;
    Decimal.sinh = sinh;          // ES6
    Decimal.sqrt = sqrt;
    Decimal.sub = sub;
    Decimal.sum = sum;
    Decimal.tan = tan;
    Decimal.tanh = tanh;          // ES6
    Decimal.trunc = trunc;        // ES6

    if (obj === void 0) obj = {};
    if (obj) {
      if (obj.defaults !== true) {
        ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'maxE', 'minE', 'modulo', 'crypto'];
        for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
      }
    }

    Decimal.config(obj);

    return Decimal;
  }


  /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function div(x, y) {
    return new this(x).div(y);
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */
  function exp(x) {
    return new this(x).exp();
  }


  /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */
  function floor(x) {
    return finalise(x = new this(x), x.e + 1, 3);
  }


  /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   * arguments {number|string|Decimal}
   *
   */
  function hypot() {
    var i, n,
      t = new this(0);

    external = false;

    for (i = 0; i < arguments.length;) {
      n = new this(arguments[i++]);
      if (!n.d) {
        if (n.s) {
          external = true;
          return new this(1 / 0);
        }
        t = n;
      } else if (t.d) {
        t = t.plus(n.times(n));
      }
    }

    external = true;

    return t.sqrt();
  }


  /*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */
  function isDecimalInstance(obj) {
    return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function ln(x) {
    return new this(x).ln();
  }


  /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */
  function log(x, y) {
    return new this(x).log(y);
  }


  /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log2(x) {
    return new this(x).log(2);
  }


  /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log10(x) {
    return new this(x).log(10);
  }


  /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function max() {
    return maxOrMin(this, arguments, 'lt');
  }


  /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function min() {
    return maxOrMin(this, arguments, 'gt');
  }


  /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mod(x, y) {
    return new this(x).mod(y);
  }


  /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mul(x, y) {
    return new this(x).mul(y);
  }


  /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */
  function pow(x, y) {
    return new this(x).pow(y);
  }


  /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */
  function random(sd) {
    var d, e, k, n,
      i = 0,
      r = new this(1),
      rd = [];

    if (sd === void 0) sd = this.precision;
    else checkInt32(sd, 1, MAX_DIGITS);

    k = Math.ceil(sd / LOG_BASE);

    if (!this.crypto) {
      for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;

    // Browsers supporting crypto.getRandomValues.
    } else if (crypto.getRandomValues) {
      d = crypto.getRandomValues(new Uint32Array(k));

      for (; i < k;) {
        n = d[i];

        // 0 <= n < 4294967296
        // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
        if (n >= 4.29e9) {
          d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
        } else {

          // 0 <= n <= 4289999999
          // 0 <= (n % 1e7) <= 9999999
          rd[i++] = n % 1e7;
        }
      }

    // Node.js supporting crypto.randomBytes.
    } else if (crypto.randomBytes) {

      // buffer
      d = crypto.randomBytes(k *= 4);

      for (; i < k;) {

        // 0 <= n < 2147483648
        n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);

        // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
        if (n >= 2.14e9) {
          crypto.randomBytes(4).copy(d, i);
        } else {

          // 0 <= n <= 2139999999
          // 0 <= (n % 1e7) <= 9999999
          rd.push(n % 1e7);
          i += 4;
        }
      }

      i = k / 4;
    } else {
      throw Error(cryptoUnavailable);
    }

    k = rd[--i];
    sd %= LOG_BASE;

    // Convert trailing digits to zeros according to sd.
    if (k && sd) {
      n = mathpow(10, LOG_BASE - sd);
      rd[i] = (k / n | 0) * n;
    }

    // Remove trailing words which are zero.
    for (; rd[i] === 0; i--) rd.pop();

    // Zero?
    if (i < 0) {
      e = 0;
      rd = [0];
    } else {
      e = -1;

      // Remove leading words which are zero and adjust exponent accordingly.
      for (; rd[0] === 0; e -= LOG_BASE) rd.shift();

      // Count the digits of the first word of rd to determine leading zeros.
      for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;

      // Adjust the exponent for leading zeros of the first word of rd.
      if (k < LOG_BASE) e -= LOG_BASE - k;
    }

    r.e = e;
    r.d = rd;

    return r;
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */
  function round(x) {
    return finalise(x = new this(x), x.e + 1, this.rounding);
  }


  /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   * x {number|string|Decimal}
   *
   */
  function sign(x) {
    x = new this(x);
    return x.d ? (x.d[0] ? x.s : 0 * x.s) : x.s || NaN;
  }


  /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sin(x) {
    return new this(x).sin();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sinh(x) {
    return new this(x).sinh();
  }


  /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function sqrt(x) {
    return new this(x).sqrt();
  }


  /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function sub(x, y) {
    return new this(x).sub(y);
  }


  /*
   * Return a new Decimal whose value is the sum of the arguments, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * Only the result is rounded, not the intermediate calculations.
   *
   * arguments {number|string|Decimal}
   *
   */
  function sum() {
    var i = 0,
      args = arguments,
      x = new this(args[i]);

    external = false;
    for (; x.s && ++i < args.length;) x = x.plus(args[i]);
    external = true;

    return finalise(x, this.precision, this.rounding);
  }


  /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tan(x) {
    return new this(x).tan();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tanh(x) {
    return new this(x).tanh();
  }


  /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */
  function trunc(x) {
    return finalise(x = new this(x), x.e + 1, 1);
  }


  // Create and configure initial Decimal constructor.
  Decimal = clone(DEFAULTS);
  Decimal.prototype.constructor = Decimal;
  Decimal['default'] = Decimal.Decimal = Decimal;

  // Create the internal constants from their string values.
  LN10 = new Decimal(LN10);
  PI = new Decimal(PI);


  // Export.


  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Decimal;
    });

  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
      P[Symbol['for']('nodejs.util.inspect.custom')] = P.toString;
      P[Symbol.toStringTag] = 'Decimal';
    }

    module.exports = Decimal;

  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self ? self : window;
    }

    noConflict = globalScope.Decimal;
    Decimal.noConflict = function () {
      globalScope.Decimal = noConflict;
      return Decimal;
    };

    globalScope.Decimal = Decimal;
  }
})(this);

},{}],28:[function(require,module,exports){
"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const f=.009,n={"\xBC":"1/4","\xBD":"1/2","\xBE":"3/4","\u2150":"1/7","\u2151":"1/9","\u2152":"1/10","\u2153":"1/3","\u2154":"2/3","\u2155":"1/5","\u2156":"2/5","\u2157":"3/5","\u2158":"4/5","\u2159":"1/6","\u215A":"5/6","\u215B":"1/8","\u215C":"3/8","\u215D":"5/8","\u215E":"7/8","\u200B1\u204416":"1/16","\u200B3\u204416":"3/16","\u200B5\u204416":"5/16","\u200B7\u204416":"7/16","\u200B9\u204416":"9/16","\u200B11\u204416":"11/16","\u200B13\u204416":"13/16","\u200B15\u204416":"15/16"},i=[[.33,"\u2153"],[.66,"\u2154"],[.2,"\u2155"],[.4,"\u2156"],[.6,"\u2157"],[.8,"\u2158"],[.166,"\u2159"],[.833,"\u215A"],[.143,"\u2150"],[.111,"\u2151"],[.1,"\u2152"],[.125,"\u215B"],[.25,"\xBC"],[.375,"\u215C"],[.5,"\xBD"],[.625,"\u215D"],[.75,"\xBE"],[.875,"\u215E"],[.0625,"\u200B1\u204416"],[.1875,"\u200B3\u204416"],[.3125,"\u200B5\u204416"],[.4375,"\u200B7\u204416"],[.5625,"\u200B9\u204416"],[.6875,"\u200B11\u204416"],[.8125,"\u200B13\u204416"],[.9375,"\u200B15\u204416"]],h=(a,t,u)=>Math.abs(a-t)<u,d=(a,t)=>{var B;const u=typeof a=="string"?parseFloat(a):a;if(isNaN(u)||u===null)return null;if(u===0)return"";const l=Math.abs(u),r=Math.floor(l),c=`${u<0?"-":""}${r===0?"":`${r} `}`,s=l-r;if(s===0)return`${u}`;const o=typeof t=="boolean"?{vulgarFractions:t}:t!=null?t:{},M=o.vulgarFractions?c.trim():c,g=e=>o.vulgarFractions?e:o.fractionSlash?n[e].replace("/","\u2044"):n[e];for(const[e,m]of i)if(h(s,e,(B=o.tolerance)!=null?B:f))return`${M}${g(m)}`;return`${u}`};exports.default=d;exports.defaultTolerance=f;exports.formatQuantity=d;exports.fractionDecimalMatches=i;exports.vulgarToPlainMap=n;


},{}],29:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      var args = partialArgs.slice();
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":30,"lodash._setbinddata":36,"lodash.isobject":44}],30:[function(require,module,exports){
(function (global){(function (){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isObject = require('lodash.isobject'),
    noop = require('lodash.noop'),
    reNative = require('lodash._renative');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = reNative.test(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._renative":35,"lodash.isobject":44,"lodash.noop":46}],31:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":36,"lodash.bind":39,"lodash.identity":42,"lodash.support":47}],32:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = partialArgs.slice();
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":30,"lodash._setbinddata":36,"lodash._slice":38,"lodash.isobject":44}],33:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    bindData = bindData.slice();

    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      push.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":29,"lodash._basecreatewrapper":32,"lodash.isfunction":43}],34:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],35:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

module.exports = reNative;

},{}],36:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var noop = require('lodash.noop'),
    reNative = require('lodash._renative');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = reNative.test(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._renative":35,"lodash.noop":46}],37:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":34}],38:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],39:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    reNative = require('lodash._renative'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":33,"lodash._renative":35,"lodash._slice":38}],40:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    forOwn = require('lodash.forown');

/**
 * Iterates over elements of a collection, executing the callback for each
 * element. The callback is bound to `thisArg` and invoked with three arguments;
 * (value, index|key, collection). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * Note: As with other "Collections" methods, objects with a `length` property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
 * // => logs each number and returns '1,2,3'
 *
 * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
 * // => logs each number and returns the object (property order is not guaranteed across environments)
 */
function forEach(collection, callback, thisArg) {
  var index = -1,
      length = collection ? collection.length : 0;

  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
  if (typeof length == 'number') {
    while (++index < length) {
      if (callback(collection[index], index, collection) === false) {
        break;
      }
    }
  } else {
    forOwn(collection, callback);
  }
  return collection;
}

module.exports = forEach;

},{"lodash._basecreatecallback":31,"lodash.forown":41}],41:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own enumerable properties of an object, executing the callback
 * for each property. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, key, object). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
 *   console.log(key);
 * });
 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
 */
var forOwn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forOwn;

},{"lodash._basecreatecallback":31,"lodash._objecttypes":34,"lodash.keys":45}],42:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],43:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],44:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":34}],45:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isObject = require('lodash.isobject'),
    reNative = require('lodash._renative'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._renative":35,"lodash._shimkeys":37,"lodash.isobject":44}],46:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],47:[function(require,module,exports){
(function (global){(function (){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var reNative = require('lodash._renative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !reNative.test(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._renative":35}],48:[function(require,module,exports){
"use strict";var m=(e=>(e["\xBC"]="1/4",e["\xBD"]="1/2",e["\xBE"]="3/4",e["\u2150"]="1/7",e["\u2151"]="1/9",e["\u2152"]="1/10",e["\u2153"]="1/3",e["\u2154"]="2/3",e["\u2155"]="1/5",e["\u2156"]="2/5",e["\u2157"]="3/5",e["\u2158"]="4/5",e["\u2159"]="1/6",e["\u215A"]="5/6",e["\u215B"]="1/8",e["\u215C"]="3/8",e["\u215D"]="5/8",e["\u215E"]="7/8",e))(m||{});function R(e){let t=NaN;const o=/(¼|½|¾|⅐|⅑|⅒|⅓|⅔|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)/,f=`${e}`.replace(o,(u,n)=>` ${m[n]}`).replace(/⁄/g,"/").trim(),d=/^(-)?\s*(\d*)(\.\d+|(\s+\d*\s*)?\s*\/\s*\d+)?$/.exec(f);if(!d)return NaN;const[,p,r,s]=d;if(!r&&!s)return NaN;if(!r&&s&&s.search(/^\./)!==-1?t=0:t=parseInt(r),isNaN(t))return NaN;if(!s)return t*(p==="-"?-1:1);if(s.search(/^\./)!==-1){const u=parseFloat(s);t+=Math.round(u*1e3)/1e3}else if(s.search(/^\s*\//)!==-1){const u=parseInt(r),n=parseInt(s.replace("/",""));t=Math.round(u*1e3/n)/1e3}else{const u=s.split("/"),[n,b]=u.map(h=>parseInt(h));t+=Math.round(n*1e3/b)/1e3}return t*(p==="-"?-1:1)}module.exports=R;


},{}],49:[function(require,module,exports){
"use strict";var N=Object.defineProperty;var b=Object.getOwnPropertySymbols;var M=Object.prototype.hasOwnProperty,O=Object.prototype.propertyIsEnumerable;var q=(r,t,s)=>t in r?N(r,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):r[t]=s,p=(r,t)=>{for(var s in t||(t={}))M.call(t,s)&&q(r,s,t[s]);if(b)for(var s of b(t))O.call(t,s)&&q(r,s,t[s]);return r};Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});var v=require("numeric-quantity");function z(r){return r&&typeof r=="object"&&"default"in r?r:{default:r}}var d=z(v);const y={bag:{short:"bag",plural:"bags",alternates:[]},box:{short:"box",plural:"boxes",alternates:[]},bunch:{short:"bunch",plural:"bunches",alternates:[]},can:{short:"can",plural:"cans",alternates:[]},carton:{short:"carton",plural:"cartons",alternates:[]},centimeter:{short:"cm",plural:"centimeters",alternates:["cm."]},clove:{short:"clove",plural:"cloves",alternates:[]},container:{short:"container",plural:"containers",alternates:[]},cup:{short:"c",plural:"cups",alternates:["c.","C"]},dash:{short:"dash",plural:"dashes",alternates:[]},drop:{short:"drop",plural:"drops",alternates:[]},ear:{short:"ear",plural:"ears",alternates:[]},"fluid ounce":{short:"fl oz",plural:"fluid ounces",alternates:["fluidounce","floz","fl-oz","fluid-ounce","fluid-ounces","fluidounces","fl ounce","fl ounces","fl-ounce","fl-ounces","fluid oz","fluid-oz"]},foot:{short:"ft",plural:"feet",alternates:["ft."]},gallon:{short:"gal",plural:"gallons",alternates:["gal."]},gram:{short:"g",plural:"grams",alternates:["g."]},head:{short:"head",plural:"heads",alternates:[]},inch:{short:"in",plural:"inches",alternates:["in."]},kilogram:{short:"kg",plural:"kilograms",alternates:["kg."]},liter:{short:"l",plural:"liters",alternates:[]},meter:{short:"m",plural:"meters",alternates:["m."]},milligram:{short:"mg",plural:"milligrams",alternates:["mg."]},milliliter:{short:"ml",plural:"milliliters",alternates:["mL","ml.","mL."]},millimeter:{short:"mm",plural:"millimeters",alternates:["mm."]},ounce:{short:"oz",plural:"ounces",alternates:["oz."]},pack:{short:"pack",plural:"packs",alternates:[]},package:{short:"pkg",plural:"packages",alternates:["pkg.","pkgs"]},piece:{short:"piece",plural:"pieces",alternates:["pcs","pcs."]},pinch:{short:"pinch",plural:"pinches",alternates:[]},pint:{short:"pt",plural:"pints",alternates:["pt."]},pound:{short:"lb",plural:"pounds",alternates:["lb.","lbs","lbs."]},quart:{short:"qt",plural:"quarts",alternates:["qt.","qts","qts."]},sprig:{short:"sprig",plural:"sprigs",alternates:[]},stick:{short:"stick",plural:"sticks",alternates:[]},tablespoon:{short:"tbsp",plural:"tablespoons",alternates:["tbsp.","T"]},teaspoon:{short:"tsp",plural:"teaspoons",alternates:["tsp.","t"]},yard:{short:"yd",plural:"yards",alternates:["yd.","yds."]}},I=r=>{let t=-1;const s=r.length;let i=0;const h=[];for(;++t<s;){const f=r[t];f&&(h[i++]=f)}return h},R=(r,t)=>{const s=p(p({},y),t==null?void 0:t.additionalUOMs),i=Object.keys(s).map(l=>p({id:l},s[l]));return I(r.replace(/\n{2,}/g,`
`).split(`
`).map(l=>l.trim())).map(l=>{const e={quantity:null,quantity2:null,unitOfMeasureID:null,unitOfMeasure:null,description:"",isGroupHeader:!1},k=d.default(l.substring(0,1));if(isNaN(k))e.description=l,(/:$/.test(e.description)||/^For /i.test(e.description))&&(e.isGroupHeader=!0);else{let a=6,u=NaN;for(;a>0&&isNaN(u);)u=d.default(l.substring(0,a).trim()),u>-1&&(e.quantity=u,e.description=l.substring(a).trim()),a--}const g=/^(-|–|—|to )/i.exec(e.description);if(g){const a=g[1].length,u=d.default(e.description.substring(a).trim().substring(0,1));if(!isNaN(u)){let n=6,o=NaN;for(;n>0&&isNaN(o);)o=d.default(e.description.substring(a,n)),isNaN(o)||(e.quantity2=o,e.description=e.description.substring(n).trim()),n--}}const m=/^(fl(?:uid)?(?:\s+|-)(?:oz|ounces?)|[a-zA-Z.]+)\b(.+)/.exec(e.description);if(m){const a=m[1].replace(/\s+/g," "),u=m[2];let n="",o="",c=0;for(;c<i.length&&!n;)[...i[c].alternates,i[c].id,i[c].short,i[c].plural].includes(a)&&(n=a,o=i[c].id),c++;n&&(e.unitOfMeasureID=o,t!=null&&t.normalizeUOM?e.unitOfMeasure=o:e.unitOfMeasure=n,e.description=u.trim())}return!(t!=null&&t.allowLeadingOf)&&e.description.match(/^of\s+/i)&&(e.description=e.description.replace(/^of\s+/i,"")),e})};exports.parseIngredient=R;exports.unitsOfMeasure=y;


},{"numeric-quantity":48}],50:[function(require,module,exports){
/* global define */

(function (root, pluralize) {
  /* istanbul ignore else */
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    // Node.
    module.exports = pluralize();
  } else if (typeof define === 'function' && define.amd) {
    // AMD, registers as an anonymous module.
    define(function () {
      return pluralize();
    });
  } else {
    // Browser global.
    root.pluralize = pluralize();
  }
})(this, function () {
  // Rule storage - pluralize and singularize need to be run sequentially,
  // while other rules can be optimized using an object for instant lookups.
  var pluralRules = [];
  var singularRules = [];
  var uncountables = {};
  var irregularPlurals = {};
  var irregularSingles = {};

  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param  {(RegExp|string)} rule
   * @return {RegExp}
   */
  function sanitizeRule (rule) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }

    return rule;
  }

  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param  {string}   word
   * @param  {string}   token
   * @return {Function}
   */
  function restoreCase (word, token) {
    // Tokens are an exact match.
    if (word === token) return token;

    // Lower cased words. E.g. "hello".
    if (word === word.toLowerCase()) return token.toLowerCase();

    // Upper cased words. E.g. "WHISKY".
    if (word === word.toUpperCase()) return token.toUpperCase();

    // Title cased words. E.g. "Title".
    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    }

    // Lower cased words. E.g. "test".
    return token.toLowerCase();
  }

  /**
   * Interpolate a regexp string.
   *
   * @param  {string} str
   * @param  {Array}  args
   * @return {string}
   */
  function interpolate (str, args) {
    return str.replace(/\$(\d{1,2})/g, function (match, index) {
      return args[index] || '';
    });
  }

  /**
   * Replace a word using a rule.
   *
   * @param  {string} word
   * @param  {Array}  rule
   * @return {string}
   */
  function replace (word, rule) {
    return word.replace(rule[0], function (match, index) {
      var result = interpolate(rule[1], arguments);

      if (match === '') {
        return restoreCase(word[index - 1], result);
      }

      return restoreCase(match, result);
    });
  }

  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param  {string}   token
   * @param  {string}   word
   * @param  {Array}    rules
   * @return {string}
   */
  function sanitizeWord (token, word, rules) {
    // Empty string or doesn't need fixing.
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    var len = rules.length;

    // Iterate over the sanitization rules and use the first one to match.
    while (len--) {
      var rule = rules[len];

      if (rule[0].test(word)) return replace(word, rule);
    }

    return word;
  }

  /**
   * Replace a word with the updated word.
   *
   * @param  {Object}   replaceMap
   * @param  {Object}   keepMap
   * @param  {Array}    rules
   * @return {Function}
   */
  function replaceWord (replaceMap, keepMap, rules) {
    return function (word) {
      // Get the correct token and case restoration functions.
      var token = word.toLowerCase();

      // Check against the keep object map.
      if (keepMap.hasOwnProperty(token)) {
        return restoreCase(word, token);
      }

      // Check against the replacement map for a direct word replacement.
      if (replaceMap.hasOwnProperty(token)) {
        return restoreCase(word, replaceMap[token]);
      }

      // Run all the rules against the word.
      return sanitizeWord(token, word, rules);
    };
  }

  /**
   * Check if a word is part of the map.
   */
  function checkWord (replaceMap, keepMap, rules, bool) {
    return function (word) {
      var token = word.toLowerCase();

      if (keepMap.hasOwnProperty(token)) return true;
      if (replaceMap.hasOwnProperty(token)) return false;

      return sanitizeWord(token, token, rules) === token;
    };
  }

  /**
   * Pluralize or singularize a word based on the passed in count.
   *
   * @param  {string}  word      The word to pluralize
   * @param  {number}  count     How many of the word exist
   * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
   * @return {string}
   */
  function pluralize (word, count, inclusive) {
    var pluralized = count === 1
      ? pluralize.singular(word) : pluralize.plural(word);

    return (inclusive ? count + ' ' : '') + pluralized;
  }

  /**
   * Pluralize a word.
   *
   * @type {Function}
   */
  pluralize.plural = replaceWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Check if a word is plural.
   *
   * @type {Function}
   */
  pluralize.isPlural = checkWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Singularize a word.
   *
   * @type {Function}
   */
  pluralize.singular = replaceWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Check if a word is singular.
   *
   * @type {Function}
   */
  pluralize.isSingular = checkWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Add a pluralization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addPluralRule = function (rule, replacement) {
    pluralRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add a singularization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addSingularRule = function (rule, replacement) {
    singularRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add an uncountable word rule.
   *
   * @param {(string|RegExp)} word
   */
  pluralize.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    }

    // Set singular and plural references for the word.
    pluralize.addPluralRule(word, '$0');
    pluralize.addSingularRule(word, '$0');
  };

  /**
   * Add an irregular word definition.
   *
   * @param {string} single
   * @param {string} plural
   */
  pluralize.addIrregularRule = function (single, plural) {
    plural = plural.toLowerCase();
    single = single.toLowerCase();

    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };

  /**
   * Irregular rules.
   */
  [
    // Pronouns.
    ['I', 'we'],
    ['me', 'us'],
    ['he', 'they'],
    ['she', 'they'],
    ['them', 'them'],
    ['myself', 'ourselves'],
    ['yourself', 'yourselves'],
    ['itself', 'themselves'],
    ['herself', 'themselves'],
    ['himself', 'themselves'],
    ['themself', 'themselves'],
    ['is', 'are'],
    ['was', 'were'],
    ['has', 'have'],
    ['this', 'these'],
    ['that', 'those'],
    // Words ending in with a consonant and `o`.
    ['echo', 'echoes'],
    ['dingo', 'dingoes'],
    ['volcano', 'volcanoes'],
    ['tornado', 'tornadoes'],
    ['torpedo', 'torpedoes'],
    // Ends with `us`.
    ['genus', 'genera'],
    ['viscus', 'viscera'],
    // Ends with `ma`.
    ['stigma', 'stigmata'],
    ['stoma', 'stomata'],
    ['dogma', 'dogmata'],
    ['lemma', 'lemmata'],
    ['schema', 'schemata'],
    ['anathema', 'anathemata'],
    // Other irregular rules.
    ['ox', 'oxen'],
    ['axe', 'axes'],
    ['die', 'dice'],
    ['yes', 'yeses'],
    ['foot', 'feet'],
    ['eave', 'eaves'],
    ['goose', 'geese'],
    ['tooth', 'teeth'],
    ['quiz', 'quizzes'],
    ['human', 'humans'],
    ['proof', 'proofs'],
    ['carve', 'carves'],
    ['valve', 'valves'],
    ['looey', 'looies'],
    ['thief', 'thieves'],
    ['groove', 'grooves'],
    ['pickaxe', 'pickaxes'],
    ['passerby', 'passersby']
  ].forEach(function (rule) {
    return pluralize.addIrregularRule(rule[0], rule[1]);
  });

  /**
   * Pluralization rules.
   */
  [
    [/s?$/i, 's'],
    [/[^\u0000-\u007F]$/i, '$0'],
    [/([^aeiou]ese)$/i, '$1'],
    [/(ax|test)is$/i, '$1es'],
    [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
    [/(e[mn]u)s?$/i, '$1s'],
    [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
    [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
    [/(seraph|cherub)(?:im)?$/i, '$1im'],
    [/(her|at|gr)o$/i, '$1oes'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
    [/sis$/i, 'ses'],
    [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
    [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/([^ch][ieo][ln])ey$/i, '$1ies'],
    [/(x|ch|ss|sh|zz)$/i, '$1es'],
    [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
    [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
    [/(pe)(?:rson|ople)$/i, '$1ople'],
    [/(child)(?:ren)?$/i, '$1ren'],
    [/eaux$/i, '$0'],
    [/m[ae]n$/i, 'men'],
    ['thou', 'you']
  ].forEach(function (rule) {
    return pluralize.addPluralRule(rule[0], rule[1]);
  });

  /**
   * Singularization rules.
   */
  [
    [/s$/i, ''],
    [/(ss)$/i, '$1'],
    [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
    [/ies$/i, 'y'],
    [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
    [/\b(mon|smil)ies$/i, '$1ey'],
    [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
    [/(seraph|cherub)im$/i, '$1'],
    [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
    [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
    [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
    [/(test)(?:is|es)$/i, '$1is'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    [/(alumn|alg|vertebr)ae$/i, '$1a'],
    [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    [/(matr|append)ices$/i, '$1ix'],
    [/(pe)(rson|ople)$/i, '$1rson'],
    [/(child)ren$/i, '$1'],
    [/(eau)x?$/i, '$1'],
    [/men$/i, 'man']
  ].forEach(function (rule) {
    return pluralize.addSingularRule(rule[0], rule[1]);
  });

  /**
   * Uncountable rules.
   */
  [
    // Singular words with no plurals.
    'adulthood',
    'advice',
    'agenda',
    'aid',
    'aircraft',
    'alcohol',
    'ammo',
    'analytics',
    'anime',
    'athletics',
    'audio',
    'bison',
    'blood',
    'bream',
    'buffalo',
    'butter',
    'carp',
    'cash',
    'chassis',
    'chess',
    'clothing',
    'cod',
    'commerce',
    'cooperation',
    'corps',
    'debris',
    'diabetes',
    'digestion',
    'elk',
    'energy',
    'equipment',
    'excretion',
    'expertise',
    'firmware',
    'flounder',
    'fun',
    'gallows',
    'garbage',
    'graffiti',
    'hardware',
    'headquarters',
    'health',
    'herpes',
    'highjinks',
    'homework',
    'housework',
    'information',
    'jeans',
    'justice',
    'kudos',
    'labour',
    'literature',
    'machinery',
    'mackerel',
    'mail',
    'media',
    'mews',
    'moose',
    'music',
    'mud',
    'manga',
    'news',
    'only',
    'personnel',
    'pike',
    'plankton',
    'pliers',
    'police',
    'pollution',
    'premises',
    'rain',
    'research',
    'rice',
    'salmon',
    'scissors',
    'series',
    'sewage',
    'shambles',
    'shrimp',
    'software',
    'species',
    'staff',
    'swine',
    'tennis',
    'traffic',
    'transportation',
    'trout',
    'tuna',
    'wealth',
    'welfare',
    'whiting',
    'wildebeest',
    'wildlife',
    'you',
    /pok[eé]mon$/i,
    // Regexes.
    /[^aeiou]ese$/i, // "chinese", "japanese"
    /deer$/i, // "deer", "reindeer"
    /fish$/i, // "fish", "blowfish", "angelfish"
    /measles$/i,
    /o[iu]s$/i, // "carnivorous"
    /pox$/i, // "chickpox", "smallpox"
    /sheep$/i
  ].forEach(pluralize.addUncountableRule);

  return pluralize;
});

},{}],51:[function(require,module,exports){
(function (global){(function (){
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __spreadArray;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __classPrivateFieldIn;
var __createBinding;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };

    __extends = function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    };

    __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function() { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    /** @deprecated */
    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    /** @deprecated */
    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __spreadArray = function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    };

    __classPrivateFieldIn = function (state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});

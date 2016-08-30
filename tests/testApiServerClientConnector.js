/**
 * This is a unit test to validate proper functionality of the ApiServerClientConnector class
 */
const chai = require('chai');
const expect = chai.expect;
const kalturaTypes = require('../lib/client/KalturaTypes');
const ApiClientConnector = require('../lib/infra/ApiServerClientConnector');

const serviceUrl = KalturaConfig.config.testing.serviceUrl;
const secret = KalturaConfig.config.testing.secret;
const partnerId = KalturaConfig.config.testing.partnerId;
const connector = new ApiClientConnector(partnerId, secret, kalturaTypes.KalturaSessionType.ADMIN, serviceUrl);
const uiConfId = KalturaConfig.config.testing.uiConfId;
const impersonatePartnerId = KalturaConfig.config.testing.impersonatePartnerId;
const flavorId = KalturaConfig.config.testing.flavorId;

describe('testApiClientConnector', function () {
	it('test session start', function () {
		return connector._startSession().then(function (data) {
			expect(data).to.not.be.null;
		}, function (err) {
			expect(err).to.be.null;
		});
	});

	it('test api exception', function () {
		const falseConnector = new ApiClientConnector(partnerId, '12345678910111213abcdefghijklmno', kalturaTypes.KalturaSessionType.ADMIN, serviceUrl);
		return falseConnector._startSession().then(function (data) {
			expect(data).to.be.null;
		}, function (err) {
			expect(err).to.equal('KalturaAPIException Error while starting session for partner [-6]');
		});
	});

	it('test handleApiRequest with uiConf get action ', function () {
		return connector.handleApiRequest('uiConf', 'get', [uiConfId], impersonatePartnerId).then(function (data) {
			expect(data).to.have.property('objectType').and.equal('KalturaUiConf');
		}, function (err) {
			expect(err).to.be.null;
		});
	});

	it('test setValueInCache  ', function () {
		const params = { apiCallService: 'someService', apiCallAction: 'someAction', params: [199], impersonatePartnerId: 101 };
		const res = { member1: 'val1', member2: 'val2' };
		return ApiClientConnector._setValueInCache({ cacheParams: params, response: res }).then(function (data) {
			expect(data.response).to.have.property('member1').and.equal('val1');
			expect(data.response).to.have.property('member2').and.equal('val2');
		}, function (err) {
			expect(err).to.be.null;
		});
	});

	it('test getValueFromCache  ', function () {
		const params = { apiCallService: 'someService', apiCallAction: 'someAction', params: [199], impersonatePartnerId: 101};
		return ApiClientConnector._getValueFromCache(params).then(
			function (data) {
				expect(data.response).to.have.property('member1').and.equal('val1');
				expect(data.response).to.have.property('member2').and.equal('val2');
			}, function (err) {
				expect(err).to.be.null;
			}
		);
	});

	it('test handleApiRequest with uiConf get action with timeout', function () {
		return connector.handleApiRequest('uiConf', 'get', [uiConfId], impersonatePartnerId).timeout(1).then(function (data) {
			expect(data).to.be.null;
		}, function (err) { //TimeoutError
			expect(err).to.be.an.instanceof(Promise.TimeoutError);
			expect(err.message).to.equal('operation timed out');
		});
	});

	it('test handleApiRequest with flavorId get action', function () {
		return connector.handleApiRequest('flavorAsset', 'get', [flavorId], impersonatePartnerId).then(function (data) {
			console.log(`flavorID data: ${data}`);
			expect(data).not.to.be.null;
		}, function (err) {
			console.log(`error:${err}`);
			expect(err).to.be.null;
		});
	});
});

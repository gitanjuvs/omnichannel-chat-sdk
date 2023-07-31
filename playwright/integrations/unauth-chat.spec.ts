import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import platform, { isBrowser } from '../../src/utils/platform';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('UnauthenticatedChat @UnauthenticatedChat', () => {

    test.afterAll(({ }) => {

        expect(platform.isBrowser()).toBe(false);

    });
    test.only('ChatSDK.getConversationDetails() should not fail', async ({ page }) => {
        await page.goto(testPage);
        console.log(testPage);
        console.log(omnichannelConfig);

        const [liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const conversationDetails = await chatSDK.getConversationDetails();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    conversationDetails
                };

                await chatSDK.endChat();
                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const { requestId, conversationDetails } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        console.log("conversationDetails Status: "+ conversationDetails.state + ", ConversationId: "+ conversationDetails.conversationId+ ", canRenderPostChat: "+ conversationDetails.canRenderPostChat);
        console.log("status:" + liveWorkItemDetailsResponse.status());
        console.log("generated URL:" + liveWorkItemDetailsRequestUrl);
        console.log("request url:"+ liveWorkItemDetailsRequest.url());
        // console.log(liveWorkItemDetailsResponse);
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        console.log(liveWorkItemDetailsResponseDataJson);

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).toBe(conversationDetails.state);
        expect(liveWorkItemDetailsResponseDataJson.ConversationId).toBe(conversationDetails.conversationId);
        expect(liveWorkItemDetailsResponseDataJson.CanRenderPostChat).toBe(conversationDetails.canRenderPostChat);
    });

    test('ChatSDK.getConversationDetails() with liveChatContext should not fail', async ({page}) => {
        await page.goto(testPage);
        console.log(testPage);
        console.log(omnichannelConfig);
        const [invalidLiveWorkItemDetailsRequest, invalidLiveWorkItemDetailsResponse, _, liveChatContextLiveWorkItemDetailsRequest, liveChatContextLiveWorkItemDetailsResponse,  runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                const runtimeContext = {
                    liveChatContext
                };

                await chatSDK.endChat();
                runtimeContext.invalidRequestId = chatSDK.requestId;

                const invalidRequestIdConversationDetails = await chatSDK.getConversationDetails();
                runtimeContext.invalidRequestIdConversationDetails = invalidRequestIdConversationDetails;

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const liveChatContextConversationDetails = await chatSDK.getConversationDetails({liveChatContext: runtimeContext.liveChatContext});
                runtimeContext.liveChatContextConversationDetails = liveChatContextConversationDetails;

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const { invalidRequestId, liveChatContext, invalidRequestIdConversationDetails, liveChatContextConversationDetails } = runtimeContext;
        const invalidLiveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${invalidRequestId}?channelId=lcw`;
        const liveChatContextLiveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${liveChatContext.requestId}?channelId=lcw`;

        expect(invalidLiveWorkItemDetailsRequest.url() === invalidLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(invalidLiveWorkItemDetailsResponse.status()).toBe(400);
        expect(liveChatContextLiveWorkItemDetailsRequest.url() === liveChatContextLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveChatContextLiveWorkItemDetailsResponse.status()).toBe(200);
        console.log(liveChatContextLiveWorkItemDetailsResponse);
        expect(invalidRequestIdConversationDetails).toEqual({});
        expect(liveChatContextConversationDetails.state).toBeDefined();
        expect(liveChatContextConversationDetails.conversationId).toBeDefined();
        expect(liveChatContextConversationDetails.canRenderPostChat).toBeDefined();
    });
});
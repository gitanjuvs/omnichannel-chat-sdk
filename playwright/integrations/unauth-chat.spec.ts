import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('UnauthenticatedChat @UnauthenticatedChat', () => {
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
        // console.log(liveWorkItemDetailsRequest.url());
        console.log(await liveWorkItemDetailsResponse.json());
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        console.log(liveWorkItemDetailsResponseDataJson);

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).toBe(conversationDetails.state);
        expect(liveWorkItemDetailsResponseDataJson.ConversationId).toBe(conversationDetails.conversationId);
        expect(liveWorkItemDetailsResponseDataJson.CanRenderPostChat).toBe(conversationDetails.canRenderPostChat);
    });
});
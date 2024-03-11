import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import { createPerformanceData, performanceTestResult, performanceData, ThresholdByScenario } from '../utils/PerformanceHandler';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithAttachments');

let performanceDataTest: performanceData;
let performanceTestData: performanceData[] = [];
test.afterEach(() => {
    performanceTestData.push(performanceDataTest);
});

test.afterAll(async () => {
    await performanceTestResult(performanceTestData);
});

test.describe('Performance @Performance ', () => {
    test('ChatSDK.uploadFileAttachment()', async ({ page }) => {
        await page.goto(testPage);

        const file = {
            name: 'test',
            type: 'txt',
            size: '10Mb',
            data: 'Hello'
        };
        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, file }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                let startTime = new Date();
                await chatSDK.uploadFileAttachment(file);
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const messages = await chatSDK.getMessages();

                const attachmentMessageResult = messages.filter(message => message.fileMetadata !== undefined);
                const attachmentMessage = attachmentMessageResult[0];

                const runtimeContext = {
                    timeTaken: timeTaken,
                    attachmentMessage: attachmentMessage
                };

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, file }),
        ]);

        const { attachmentMessage, timeTaken } = runtimeContext;
        console.log("chatSDK.uploadFileAttachment(): " + timeTaken);

        expect(attachmentMessage.fileMetadata.name).toEqual(file.name);

        const executionTime = runtimeContext.timeTaken;
        const data: performanceData = createPerformanceData("chatSDK.uploadFileAttachment()", executionTime, ThresholdByScenario.ChatSDK_UploadFileAttachment);
        performanceDataTest = data; 
    });
});
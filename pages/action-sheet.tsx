import React, { useEffect, useState } from 'react';
import {
  useLocalStore,
} from '@deep-foundation/store/local';
import {
  DeepProvider,
  useDeep,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';

import { Box, Button, ChakraProvider, Code, Input, Radio, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { ActionSheet, ActionSheetButton, ActionSheetButtonStyle, ShowActionsOptions } from '@capacitor/action-sheet';
import { insertActionSheetToDeep } from '../imports/action-sheet/insert-action-sheet-to-deep';
import { useNotNotifiedLinksHandling } from '../imports/notification/use-not-notified-links-handling';
import { getActionSheetDataFromDeep } from '../imports/action-sheet/get-action-sheet-data-from-deep';
import { insertNotifiedLinks } from '../imports/notification/insert-notified-links';
import { insertActionSheetResultToDeep } from '../imports/action-sheet/insert-action-sheet-result-to-deep';
import { PACKAGE_NAME } from '../imports/action-sheet/package-name';

const defaultOption: ActionSheetButton = { title: "Action Sheet Option Title", style: ActionSheetButtonStyle.Default }
const defaultActionSheet: ShowActionsOptions = {
  title: 'Title',
  message: 'Message',
  options: [
    {
      title: 'OptionTitle1',
    },
    {
      title: 'OptionTitle2',
    },
    {
      title: 'OptionTitle3',
      style: ActionSheetButtonStyle.Destructive,
    },
  ],
}

function Content() {
  const deep = useDeep();
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );
  useEffect(() => {
    defineCustomElements(window);
    self["ActionSheet"] = ActionSheet;
    self["ActionSheetButtonStyle"] = ActionSheetButtonStyle;
  }, []);

  {
    const { data: notNotifiedActionSheetLinks, loading, error } = useDeepSubscription({
      type_id: {
        _id: [PACKAGE_NAME, "ActionSheet"]
      },
      out: {
        type_id: {
          _id: [PACKAGE_NAME, 'Notify'],
        },
        to_id: deviceLinkId,
        _not: {
          out: {
            type_id: {
              _id: [PACKAGE_NAME, 'Notified'],
            },
            to_id: deviceLinkId,
          },
        },
      }
    });

    useEffect(() => {
      new Promise(async () => {

        for (const actionSheetLink of notNotifiedActionSheetLinks) {
          const actionSheetOptions = await getActionSheetDataFromDeep({ deep, actionSheetLinkId: actionSheetLink.id });
          const actionSheetResult = await ActionSheet.showActions(actionSheetOptions);
          const { data: [notifyLink] } = await deep.select({
            type_id: {
              _id: [PACKAGE_NAME, "Notify"]
            },
            from_id: actionSheetLink.id
          })
          await insertActionSheetResultToDeep({ deep, notifyLinkId: notifyLink.id, actionSheetResult })
        }
        const { data: notifyLinks } = await deep.select({
          type_id: {
            _id: [PACKAGE_NAME, "Notify"]
          },
          from_id: {
            _in: notNotifiedActionSheetLinks.map(link => link.id),
          },
          _not: {
            out: { type_id: {
              _id: [PACKAGE_NAME, "Notified"]
            } }
          }
        })

        const notifiedTypeLinkId = await deep.id(PACKAGE_NAME, "Notified")
        const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
        await deep.insert(
          notifyLinks.map((notifyLink) => ({
            type_id: notifiedTypeLinkId,
            from_id: notifyLink.id,
            to_id: deviceLinkId,
            in: {
              data: [
                {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId
                },
              ]
            }
          })))

      })
    }, [notNotifiedActionSheetLinks, loading, error])
  }


  const [actionSheetToInsert, setActionSheetToInsert] = useState<string>(JSON.stringify(
    defaultActionSheet
    ,null, 2
   ));

  // const [actionSheetTitle, setActionSheetTitle] = useState<string | undefined>("Title");
  // const [actionSheetMessage, setActionSheetMessage] = useState<string | undefined>("Message");
  // const [actionSheetOptions, setActionSheetOptions] = useState<ActionSheetButton[] | undefined>([defaultOption, defaultOption, defaultOption]);
  // const [actionSheetOptionInputsCount, dispatchActionSheetOptionInputsCount] = useReducer((state, action) => {
  //   if (action.type === "++") {
  //     return ++state;
  //   } else {
  //     return --state;
  //   }
  // }, 0);

  return (
    <Stack>
        <Code display={"block"} whiteSpace={"pre"}>
        {
`
package_name="action-sheet" 
npx ts-node "./imports/\${package_name}/install-package.ts"
`
        }
      </Code>
      {/* <Input value={actionSheetTitle} onChange={async (event) => {
        setActionSheetTitle(event.target.value)
      }}></Input>
      <Input value={actionSheetMessage} onChange={async (event) => {
        setActionSheetMessage(event.target.value)
      }}></Input>
      <Button onClick={async () => {
        setActionSheetOptions((oldActionSheets) => {
          const newOptions = oldActionSheets ? [...oldActionSheets, defaultOption] : [defaultOption];
          return newOptions
        })
      }}>++ Action Sheet Option</Button>
      <Button isDisabled={!actionSheetOptions} onClick={async () => {
        setActionSheetOptions((oldActionSheets) => {
          const newActionSheets = [...oldActionSheets]
          newActionSheets.pop();
          return newActionSheets
        })
      }}>-- Action Sheet Option</Button>
      {
        actionSheetOptions && actionSheetOptions.map((actionSheetOption, i) => (
          <Box key={i}>
            <Input value={actionSheetOption.title} onChange={async (event) => {
              setActionSheetOptions((oldActionSheets) => {
                const newActionSheets = [...oldActionSheets];
                const newActionSheet = actionSheetOption;
                newActionSheet.title = event.target.value;
                newActionSheets[i] = newActionSheet;
                return newActionSheets;
              })
            }}></Input>
            <RadioGroup value={actionSheetOption.style} onChange={async (value) => {
              setActionSheetOptions((oldActionSheets) => {
                const newActionSheets = [...oldActionSheets];
                const newActionSheet = actionSheetOption;
                newActionSheet.style = ActionSheetButtonStyle[value];
                newActionSheets[i] = newActionSheet;
                return newActionSheets;
              })
            }}>
              <Radio value={ActionSheetButtonStyle.Cancel} title={ActionSheetButtonStyle.Cancel}>{ActionSheetButtonStyle.Cancel}</Radio>
              <Radio value={ActionSheetButtonStyle.Default} title={ActionSheetButtonStyle.Default}>{ActionSheetButtonStyle.Default}</Radio>
              <Radio value={ActionSheetButtonStyle.Destructive} title={ActionSheetButtonStyle.Destructive}>{ActionSheetButtonStyle.Destructive}</Radio>
            </RadioGroup>


          </Box>
        ))
      }
      <Button onClick={async () => {
        await insertActionSheetToDeep({
          deep, containInLinkId: deep.linkId, actionSheetData: {
            title: actionSheetTitle,
            message: actionSheetMessage,
            options: actionSheetOptions
          }
        })
      }}>Insert Action Sheet</Button> */}
      <Textarea value={actionSheetToInsert} rows={30}/>
      <Button onClick={async () => {
        insertActionSheetToDeep({deep,containInLinkId: deep.linkId, actionSheetData: JSON.parse(actionSheetToInsert)})
      }}>Insert Action Sheet</Button>
      <Text>
        Insert Notify link from ActionSheet to Device. You should see action-sheet on your page after that and result will be saved to deep.
      </Text>
            <Code display={"block"} whiteSpace={"pre"}>
{
  `
await deep.insert({
    type_id: await deep.id("${PACKAGE_NAME}", "Notify"),
    from_id: actionSheetLinkId, 
    to_id: deviceLinkId, 
    in: {data: {type_id: await deep.id("@deep-foundation/core", "Contain"), from_id: deep.linkId}}
})
  `
}
      </Code>
    </Stack>
  );
}

export default function ActionSheetPage() {
  return (
    <ChakraProvider>
      <Provider>
        <DeepProvider>
          <Content />
        </DeepProvider>
      </Provider>
    </ChakraProvider>
  );
}

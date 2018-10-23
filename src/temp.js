// create new document
function getNewID() {
  return new Promise((resolve, reject) => {
    DRIVE.files.generateIds((err, res) => {
      if (err) return reject(err);
      else {
        resolve(res.data.ids[0]);
      }
    });
  });
}

// function createMetaData(metaData) {
//   if (secrets && secrets.detailsFileID) {

//   } else {
//     console.error('could not file detailsFileID');
//   }
// }

async function createEssay(filePath, metaData) {
  const id = await getNewID().catch(err => {
    console.error(err);
    return getRandomID();
  });
  const fileMetadata = {
    title: id,
    mimeType: 'application/vnd.google-apps.document'
  };
  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(filePath)
  };
  DRIVE.files.insert(
    {
      resource: fileMetadata,
      media: media,
      fields: 'id'
    },
    function(err, file) {
      if (err) {
        console.error(err);
      } else {
        console.log('File Id:', file.id);
        assert.equal(file.id, id);
      }
    }
  );
}

// watch Files

// function watchFile(fileId, channelId, channelType, channelAddress) {
//   var resource = {
//     'id': channelId,
//     'type': channelType,
//     'address': channelAddress
//   };
//   var request = gapi.client.drive.files.watch({
//     'fileId': fileId,
//     'resource': resource
//   });
//   request.execute(function (channel) {
//     console.log(channel);
//   });
// }

// function watchFiles(fileIds) {
//   const channelId = getID();
//   const channelType = 'web_hook';
//   const channelAddress = "/updates";
//   fileIds.forEach(id => {
//     watchFile(id, channelId, channelType, channelAddress);
//   });
// }

// exports

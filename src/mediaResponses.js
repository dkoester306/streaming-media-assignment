const fs = require('fs'); // pull the file system module into program

const path = require('path');



const getChunk = (response, contentType, start, end, total) => {
  const chunkSize = (end - start) + 1;

  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': contentType,

  });
};

const getStreamFile = (response, file, start, end) => {
  const stream = fs.createReadStream(file, { start, end });

  stream.on('open', () => {
    stream.pipe(response);
  });

  stream.on('error', (streamErr) => {
    stream.end(streamErr);
  });

  return stream;
};

const loadSteam = (request, response, file, contentType, stats) => {
  let { range } = request.headers;

  if (!range) { range = 'bytes=0-'; }

  const positions = range.replace(/bytes=/, '').split('-');

  let start = parseInt(positions[0], 10);

  const total = stats.size;

  const end = positions[1]
    ? parseInt(positions[1], 10)
    : total - 1;

  if (start > end) { start = end - 1; }

  //

  getChunk(response, contentType, start, end, total);
  return getStreamFile(response, file, start, end);
};


const loadFile = (request, response, filePath, contentType) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') { response.writeHead(404); }

      return response.end(err);
    }

    return loadSteam(request, response, file, contentType, stats);
  });
};


// load the party.mp4 file
const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};
// load the bling.mp3 file
const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};
// load the party.mp4 file
const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBird = getBird;
module.exports.getBling = getBling;

const db = require("../utils/dbConn");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
releaseModel = {}


const releaseSchema = mongoose.Schema({
  userId: { type: [String] },
  title: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  youtubechannelLinkId: { type: String, default: '' },
  step1: {
    subTitle: { type: String, default: "" },
    primaryArtist: {
      type: [{
        userId: String,
        name: String,
        linkId: String,
        itunesLinkId: String
      }], default: []
    },
    featuring: {
      type: [{
        userId: String,
        name: String,
        linkId: String,
        itunesLinkId: String
      }], default: []
    },
    isVariousArtists: { type: String, default: ""},
    genre: { type: String, default: "" },
    subGenre: { type: String, default: "" },
    labelName: { type: String, default: "" },
    format: { type: String, default: "" },
    originalReleaseDate: { type: String, default: "" },
    pYear: { type: String, default: "" },
    pline: { type: String, default: "" },
    cYear: { type: String, default: "" },
    cline: { type: String, default: "" },
    productionYear: { type: String, default: "" },
    UPCEAN: { type: String, default: "" },
    producerCatalogueNumber: { type: String, default: "" },
    coverImage: { type: String, default: "" }
  },
  step2: [
    {
      fileName: { type: String, default: "" },
      fileType: { type: String, default: "" },
      fileData: { type: String, default: "" }
    }
  ],
  step3: [
    {
      ContentType: { type: String, default: "Audio" },
      PrimaryTrackType: { type: String, default: "Music" },
      SecondaryTrackType: { type: String, default: "Original" },
      Instrumental: { type: Boolean, default: false },
      Title: { type: String, default: "" },
      VersionSubtitle: { type: String, default: "" },
      PrimaryArtist: [
        {
          id: { type: String },
          name: { type: String },
          linkId: { type: String, required: false },
          itunesLinkId: { type: String, required: false },
        }
      ],
      Featuring: [
        {
          id: { type: String },
          name: { type: String, },
          linkId: { type: String, required: false },
          itunesLinkId: { type: String, required: false },
        }
      ],
      Remixer: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" }
        }
      ],
      Author: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          iprs: { type: String, default: "" }

        }
      ],
      Composer: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          iprs: { type: String, default: "" }

        }
      ],
      Arranger: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" }
        }
      ],
      Producer: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" }
        }
      ],
      pYear: { type: String, default: "" },
      Pline: { type: String, default: "" },
      cLine: { type: String, default: "" },
      cYear: { type: String, default: "" },
      mood: { type: String, default: "" },


      ProductionYear: { type: Number, default: 2025 },
      Publisher: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          iprs: { type: String, default: "" }
        }
      ],
      ISRC: { type: String, default: "" },
      GenerateISRC: { type: Boolean, default: true },
      Genre: { type: String, default: "" },
      Subgenre: { type: String, default: "" },
      SecondaryGenre: { type: String, default: "" },
      SubSecondaryGenre: { type: String, default: "" },
      Price: { type: String, default: "" },
      ProducerCatalogueNumber: { type: String, default: "" },
      ParentalAdvisory: { type: String },
      PreviewStart: { type: String, default: "" },
      TrackTitleLanguage: { type: String, default: "" },
      LyricsLanguage: { type: String, default: "" },
      Lyrics: { type: String, default: "" },
      MoreInfo: { type: String, default: "" },
      Volume: { type: String, default: "" },
      selectContributory: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          value: { type: String, default: "" }
        }
      ],
      otherContributory: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          value: { type: String, default: "" }
        }
      ],
    },

  ],
  step4: [
    {
      id: { type: String, default: "" },
      name: { type: String, default: "" },
      logo: { type: String, default: "" },
      status: { type: String, default: 1 }

    }
  ],
  step5: {
    MainReleaseDate: { type: String },
    PreOrder: [
      {
        id: { type: String, default: "" },
        name: { type: String },
        date: { type: String },
        logo: { type: String }
      }
    ],
    Preview: {
      Allow90Sec: { type: Boolean, default: false }
    },
    ExclusiveReleaseDates: [
      {
        name: { type: String },
        date: { type: String },
        logo: { type: String }
      }
    ]
  },

},
  { timestamps: true }
);


const labelSchema = mongoose.Schema({
  userId: { type: Array },
  title: { type: String, required: true },
})
// const storeSchema = mongoose.Schema({
//   userId: { type: String },
//   store: [{
//     id: { type: String, default: "" },
//     name: { type: String, default: "" },
//     status: { type: String, default: "active" }
//   }],
// })

releaseModel.addUserlabel = async (label, id) => {
  const result = await db.connectDb("label", labelSchema);
  label.map(async (val) => {
    console.log("val>>>>>>>>>", val);
    const findLabel = await result.findOne({ _id: new ObjectId(val) });
    findLabel.userId.push(String(id));
    findLabel.save();
  })
}

releaseModel.releaseDelete = async (id) => {
  const result = await db.connectDb("release", releaseSchema);
  const fetData = await result.find({ _id: id }); // Ensure you're using the correct query syntax
  if (fetData.length > 0) {
    await result.deleteOne({ _id: id }); // Deletes the record
    return { success: true, message: "Record deleted successfully." };
  } else {
    return { success: false, message: "Record not found." };
  }
};

releaseModel.addOneRelease = async (data) => {
  const result = await db.connectDb("release", releaseSchema);
  let insData = await result.insertMany(data);
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
};



releaseModel.addOneStepRelease = async (body) => {
  console.log("one release body", body)
  let releaseResult = await db.connectDb("release", releaseSchema);
  // 671cb18ba0ff2158d4208ed6
  let result = await releaseResult.updateOne({ _id: body._id },
    {
      $set: {
        title: body.title,
        type: body.type,
        step1: {
          subTitle: body.step1.subTitle,
          primaryArtist: body.step1.primaryArtist,
          featuring: body.step1.featuring,
          genre: body.step1.genre,
          subGenre: body.step1.subGenre,
          labelName: body.step1.labelName,
          format: body.step1.format,
          originalReleaseDate: body.step1.originalReleaseDate,
          pline: body.step1.line,
          cline: body.step1.cline,
          cYear: body.step1.cYear,
          pYear: body.step1.pYear,
          productionYear: body.step1.productionYear,
          UPCEAN: body.step1.UPCEAN,
          producerCatalogueNumber: body.step1.producerCatalogueNumber,
          coverImage: body.coverImage
        }

      }
    })
  if (result.modifiedCount > 0 || result.upsertedCount > 0) {
    return true;
  } else {
    return false;
  }
};
releaseModel.addTwoStepRelease = async (id, filesData) => {
  try {

    const releaseResult = await db.connectDb("release", releaseSchema);

    const result = await releaseResult.updateOne(
      { _id: id },
      { $push: { step2: filesData } }
    );

    console.log("Database update result:", result);

    return result.modifiedCount > 0 || result.upsertedCount > 0;
  } catch (error) {
    console.error("Database update error:", error);
    throw new Error("Failed to update release with the provided file data.");
  }
};

// releaseModel.addTwoStepRelease = async (id, filesData) => {
//   console.log("Updating release with ID:", id);
//   try {
//     const releaseResult = await db.connectDb("release", releaseSchema);

//     const result = await releaseResult.updateOne(
//       { _id: id },
//       { $set: { step2: filesData } }
//     );

//     console.log("Database update result:", result);
//     return result.modifiedCount > 0 || result.upsertedCount > 0;
//   } catch (error) {
//     console.error("Database update error:", error);
//     throw error;
//   }
// };
// releaseModel.addTwoStepRelease = async (id,filesData) => {
//   console.log("one release body======", id,filesData)
//   let releaseResult = await db.connectDb("release", releaseSchema);

//   let result = await releaseResult.updateOne({ _id:id},
//     {
//       $set: {
//         step2: filesData
//       }
//     })
//   if (result.modifiedCount > 0 || result.upsertedCount > 0) {
//     return true;
//   } else {
//     return false;
//   }
// };

releaseModel.deleteFileFromRelease = async (releaseId, fileId) => {
  try {
    let releaseResult = await db.connectDb("release", releaseSchema);

    const result = await releaseResult.updateOne(
      { _id: releaseId },
      { $pull: { step2: { _id: fileId } } } // Corrected path
    );

    return result.modifiedCount > 0; // Returns true if a file was removed
  } catch (error) {
    console.error("Error deleting file from release:", error);
    return false;
  }
};
releaseModel.deleteTrackFromRelease = async (releaseId, trackId) => {
  try {
    let releaseResult = await db.connectDb("release", releaseSchema);

    const result = await releaseResult.updateOne(
      { _id: releaseId },
      { $pull: { step3: { _id: trackId } } } // Corrected path
    );

    return result.modifiedCount > 0; // Returns true if a file was removed
  } catch (error) {
    console.error("Error deleting file from release:", error);
    return false;
  }
};


releaseModel.addThreeStepRelease = async (body) => {
  console.log("one release body", body)
  let releaseResult = await db.connectDb("release", releaseSchema);

  let result = await releaseResult.updateOne({ _id: body._id },
    {
      $set: {
        step3: body.step3
      }
    })
  if (result.modifiedCount > 0 || result.upsertedCount > 0) {
    return true;
  } else {
    return false;
  }
};
releaseModel.addFourStepRelease = async (body) => {
  console.log("one release body", body)
  let releaseResult = await db.connectDb("release", releaseSchema);

  let result = await releaseResult.updateOne({ _id: body._id },
    {
      $set: {
        step4: body.step4
      }
    })
  if (result.modifiedCount > 0 || result.upsertedCount > 0) {
    return true;
  } else {
    return false;
  }
};
releaseModel.addFiveStepRelease = async (body) => {
  console.log("one release body", body)
  let releaseResult = await db.connectDb("release", releaseSchema);

  let result = await releaseResult.updateOne({ _id: body._id },
    {
      $set: {
        step5: body.step5
      }
    })
  if (result.modifiedCount > 0 || result.upsertedCount > 0) {
    return true;
  } else {
    return false;
  }
};

releaseModel.SubmitFinalRelease = async (body, parentId, status) => {
  let id = body.id;
  let releaseDate = body.releaseDate;
  let youtubechannelLinkId = body.youtubechannelLinkId;
  let releaseResult = await db.connectDb("release", releaseSchema);

  let query = status == "Pending" ?
    {
      $set: {
        status: status,
        youtubechannelLinkId: youtubechannelLinkId,
        "step1.originalReleaseDate": releaseDate,
      },
      $push: {
        userId: parentId // Push parentId to userId array
      }
    } :
    {
      $set: {
        status: status,
        youtubechannelLinkId: youtubechannelLinkId,
        "step1.originalReleaseDate": releaseDate,
      }
    }
  console.log("my query----------", query)
  let result = await releaseResult.updateOne({ _id: id }, query)
  if (result.modifiedCount > 0 || result.upsertedCount > 0) {
    return true;
  } else {
    return false;
  }
};


releaseModel.releaseList = async (uId, statusFilter) => {
  const result = await db.connectDb("release", releaseSchema);
  let fetData = await result.find({
    userId: { $in: [uId] },
    status: { $in: statusFilter } // Use the enum values for filtering
  });
  return fetData.length > 0 ? fetData : [];
};

// releaseModel.allReleaseList = async (uId) => {
//   const result = await db.connectDb("release", releaseSchema);
//   let fetData = await result.find();
//   if (fetData.length > 0) {
//     return fetData;
//   } else {
//     return [];
//   }
// };

releaseModel.allDraftList = async (uId, page, limit, search) => {
  const result = await db.connectDb("release", releaseSchema);


  // Base filter with status and userId
  let filter = {
    $and: [
      { status: { $in: ["Reject", "Pending"] } },
      { userId: uId } // No need for `$in` if it's a single userId
    ],
  };

   
  // Apply search filter if search term exists
  if (search) {
    filter.$text = { $search: search };
  }
  // **Fix: Count total documents before fetching paginated data**
  const totalCount = await result.countDocuments(filter);

  // Paginate data
  const fetData = await result
    .find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit) // Skip previous pages
    .limit(limit) // Limit results per page
    .exec();



  return {
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    perPage: limit,
    data: fetData
  };
};

releaseModel.allReleaseList = async (uId, page = 1, limit = 10, search) => {
  const result = await db.connectDb("release", releaseSchema);

  // Base filter with status and userId
  let filter = {
    $and: [
      { status: { $in: ["Submit", "Approve"] } },
      { userId: uId } // No need for `$in` if it's a single userId
    ],
  };


  // Apply search filter if search term exists
  if (search) {
    filter.$text = { $search: search };
  }

  // **Fix: Count total documents before fetching paginated data**
  const totalCount = await result.countDocuments(filter);

  // Fetch paginated results
  const fetData = await result
    .find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit) // Skip previous pages
    .limit(limit) // Limit results per page
    .exec();

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    perPage: limit,
    data: fetData
  };
};


releaseModel.adminAllReleaseList = async (uId, page, limit, search) => {
  const result = await db.connectDb("release", releaseSchema);

  // Base filter for status
  let filter = { status: { $in: ["Approve", "Reject", "Submit"] } };

  // Apply search filter if search term exists
  if (search) {
    filter.$text = { $search: search };
  }
  // Count total documents for pagination
  const totalCount = await result.countDocuments();

  // Paginate data
  const fetData = await result
    .find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit) // Skip previous pages
    .limit(limit) // Limit results per page
    .exec();

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    perPage: limit,
    data: fetData
  };
};


releaseModel.releaseDetails = async (releaseId) => {
  const result = await db.connectDb("release", releaseSchema);
  let fetData = await result.find({ _id: releaseId });
  if (fetData.length > 0) {
    return fetData[0];
  } else {
    return [];
  }
};
releaseModel.updateStatus = async (body) => {
  try {
    const { id, status } = body;
    console.log(body)
    // Ensure id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }

    const releaseResult = await db.connectDb("release", releaseSchema);

    // Perform the update operation
    const result = await releaseResult.updateOne(
      { _id: mongoose.Types.ObjectId(id) },
      { $set: { status } }
    );

    // Check if the update was successful
    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in updateStatus:", error.message);
    return false;
  }
};


releaseModel.getEmail = async (body) => {
  let id = body.id;
  let releaseResult = await db.connectDb("release", releaseSchema);
  let fetData = await releaseResult.findOne({ _id: mongoose.Types.ObjectId(id) });
  console.log(">>>>>>>>>>>>>>>", fetData);
  let email = await authModel.getEmail(fetData.userId[0]);
  return email;
}

releaseModel.trackUpdate = async (body) => {
  const result = await db.connectDb("release", releaseSchema);
  let fetData = await result.updateOne(
    { _id: body._id, "step3._id": body.step3[0]._id },
    { $set: { "step3.$": body.step3[0] } }
  );
  if (fetData.length > 0) {
    return true;
  } else {
    return false;
  }
};
releaseModel.addLabel = async (data) => {
  const result = await db.connectDb("label", labelSchema);
  const userId = data.userId; // Assuming the `data` object contains a `userId` field
  const noOfLabel = await authModel.getNoOfLabels(userId);
  console.log(`Current label count for user ${userId}: ${noOfLabel}`);
  const existingLabelCount = await result.countDocuments({ userId: userId });
  console.log(`Current label count for user ${userId}: ${existingLabelCount}`);
  if (existingLabelCount >= noOfLabel) {
    console.log("Cannot add more labels. Maximum limit reached.");
    return "Cannot add more labels. Maximum limit reached.";
  }

  let insData = await result.insertMany(data);
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
};

releaseModel.labelList = async (uId) => {
  const result = await db.connectDb("label", labelSchema);
  let fetData = await result.find({ userId: uId });
  if (fetData.length > 0) {
    return fetData;
  } else {
    return [];
  }
};

releaseModel.addStore = async (data) => {
  const result = await db.connectDb("store", storeSchema);
  let insData = await result.insertMany(data);
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
};

releaseModel.tracksList = async (uId) => {
  const result = await db.connectDb("release", releaseSchema);
  let fetData = await result.find({ userId: uId }, { step3: 1 });
  let arr = [];
  if (fetData.length > 0) {
    arr = fetData.reduce((acc, item) => acc.concat(item.step3), []); // Flatten each step3 array into a single array
  }
  return arr;

};


releaseModel.storeList = async (uId) => {
  const result = await db.connectDb("store", storeSchema);
  let fetData = await result.find({ userId: uId });
  if (fetData.length > 0) {
    return fetData;
  } else {
    return [];
  }
};

releaseModel.getTotalTrack = async (uId, role) => {
  try {
    const result = await db.connectDb("release", releaseSchema);
    if (role === "Admin") {
      let fetData = await result.find();
      let totalCount = 0;
      fetData.forEach((doc) => {
        if (Array.isArray(doc.step3)) {
          totalCount += doc.step3.length;
        }
      });

      const totalPending = await result.countDocuments({ status: "Pending" })
      const totalApprove = await result.countDocuments({ status: "Approve" });
      const totalReject = await result.countDocuments({ status: "Reject" });
      const totalCompany = await authModel.getCompanyCount();

      return { totalCount, totalPending, totalApprove, totalReject, totalCompany };
    } else {
      let fetData = await result.find({ userId: uId });

      let totalCount = 0;
      fetData.forEach((doc) => {
        if (Array.isArray(doc.step3)) {
          totalCount += doc.step3.length;
        }
      });
      const totalPending = await result.countDocuments({ userId: uId, status: "Pending" });
      const totalApprove = await result.countDocuments({ userId: uId, status: "Approve" });
      const totalReject = await result.countDocuments({ userId: uId, status: "Reject" });
      const totalCompany = 0;

      return { totalCount, totalPending, totalApprove, totalReject, totalCompany };
    }
  } catch (error) {
    console.error("Error in getTracks:", error);
    throw error;
  }
};




module.exports = releaseModel
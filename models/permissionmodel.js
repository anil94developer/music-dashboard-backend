const mongoose = require("mongoose");
const db = require("../utils/dbConn");
const authModal = require("../models/authmodels");
const { ObjectId } = require("mongodb")
const submenuSchema = new mongoose.Schema({
    subMenuName: { type: String, required: true },
    status: { type: Boolean, default: false },
    submenu: [this], // Recursive structure for nested submenus
});

const menuPermissionSchema = new mongoose.Schema({
    mainMenuName: { type: String, required: true },
    status: { type: Boolean, default: false },
    submenu: [submenuSchema], // Array of submenus
});

const listSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
});

const otherPermissionSchema = new mongoose.Schema({
    sectionName: { type: String, required: true },
    status: { type: Boolean, default: false },
    list: [listSchema], // Array of list items
});

const userPermissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    registeredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    menuPermission: [menuPermissionSchema], // Array of menu permissions
    otherPermission: [otherPermissionSchema], // Array of other permissions
});

const permissionModel = mongoose.model("UserPermission", userPermissionSchema);
permission = {};

permission.addPermission = async (userId, registeredUserId, data) => {
    const result = await db.connectDb("UserPermission", userPermissionSchema);
    try {
        const val = {
            userId: userId,
            registeredUserId: registeredUserId,
            menuPermission: data.menuPermission,
            otherPermission: data.otherPermission,
        };

        const user = new permissionModel(val);
        await user.save();
        return user;
    } catch (err) {
        // console.log("Error connecting to DB", err);
        return false;
    }
}


permission.findparentId = async (userid) => {
    const result = await db.connectDb("UserPermission", userPermissionSchema);
    console.log(userid)
    const user = await result.findOne({ registeredUserId: userid });
    console.log(">>>>>>>>>>>>>>>>", user)
    if (user) {
        return user.userId;
    } else {
        return false
    }
}

permission.deleteByUserId = async (userid) => {
    try {
        const result = await db.connectDb("UserPermission", userPermissionSchema);
        console.log("Deleting user permission for ID:", userid);
        const deleteResult = await result.deleteOne({ registeredUserId: userid });
        if (deleteResult.deletedCount === 0) {
            console.log("No matching user found to delete.");
            return false;  // Return false if no document was deleted
        }
        return true;  // Return true if deletion was successful
    } catch (error) {
        throw new Error("Database operation failed");
    }
};


permission.userDelete = async (id) => {
    const result = await db.connectDb("UserPermission", userPermissionSchema);

    const fetData = await result.find({ _id: id }); // Ensure you're using the correct query syntax
    if (fetData.length > 0) {
        await result.deleteOne({ _id: id }); // Deletes the record

        return { success: true, message: "Record deleted successfully." };
    } else {
        return { success: false, message: "Record not found." };
    }
};


permission.listPermissions = async (userId) => {
    const result = await db.connectDb("UserPermission", userPermissionSchema); // Connect to the UserPermission schema
    try {
        // Find all permissions for the user
        const users = await result.find({ userId: new mongoose.Types.ObjectId(userId) });
        if (!users || users.length === 0) {
            return false; // Return false if no permissions found
        }

        // Map through permissions and fetch user details
        const data = await Promise.all(
            users.map(async (userPermission) => {
                const registeredUserId = userPermission.registeredUserId;
                // console.log("Registered UserId:", registeredUserId);

                // Fetch user details
                const userData = await authModel.getUser(registeredUserId);

                // Return formatted permission object
                return {
                    menuPermission: userPermission.menuPermission,
                    otherPermission: userPermission.otherPermission,
                    userDetails: userData,
                };
            })
        );

        return data; // Return all permissions with user details
    } catch (err) {
        // console.error("Error connecting to DB:", err.message);
        return false; // Return false in case of an error
    }
};


permission.updatePermission = async (userId, data) => {
    const result = await db.connectDb("UserPermission", userPermissionSchema);
    try {
        // console.log(result,"new data")
        const user = await result.findOneAndUpdate({ registeredUserId: userId }, data, { new: true });
        if (!user) {
            return false;
        }
        return user;
    } catch (err) {
        // console.log("Error connecting to DB", err);
        return false;
    }
}

permission.profilePermissions = async (userId) => {
    // console.log(userId);
    const result = await db.connectDb("UserPermission", userPermissionSchema);
    try {

        const user = await permissionModel.findOne({ registeredUserId: new ObjectId(userId) });
        // console.log(user);
        if (!user) {
            return false;
        }
        const userData = await authModel.getUser(userId);
        if (!userData) {
            return false;
        }
        // console.log("User>>>>>", userData);
        user["userdetails"] = userData;

        const data = {
            userId: user.userId,
            menuPermission: user.menuPermission,
            otherPermission: user.otherPermission,
            userdetails: userData,
        }
        return data;
    } catch (err) {
        // console.log("Error connecting to DB", err);
        return false;
    }
}

module.exports = permission


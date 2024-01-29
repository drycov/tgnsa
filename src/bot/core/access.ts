import userData from "../data/userData";

const access = {
  UserExist: async (id: any) => {
    let user = await userData.getUserByTgId(id).then((res) => {
      return res;
    });
    if (user) {
      return true;
    }
    return false;
  },
  CheckAdminRole: async (id: any) => {
    let user = await userData.getUserByTgId(id).then((res) => {
      return res;
    });
    if (user) {
      if (user.isAdmin == true && user.userAllowed == true) {
        return true;
      } else if (user.isAdmin == false && user.userAllowed == true) {
        return false;
      } else {
        return false;
      }
    }
    return false;
  },
  CheckUserStatus: async (id: any) => {
    let user = await userData.getUserByTgId(id).then((res) => {
      return res;
    });
    if (user) {
      if (user.userAllowed == true) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },
};
export default access;

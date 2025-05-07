import NavBar from "../../components/NavBar";
function Settings() {

  return (
    <>
      <NavBar></NavBar>
      <div>
        <h1>Settings</h1>
        <button style={styles.button}>
          Logout
        </button>
      </div>
    </>
  );
}

const styles = {
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
  },
};

export default Settings;

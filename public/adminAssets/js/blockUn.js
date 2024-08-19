
// function confirmBlock(userId) {
//     swal({
//       title: "Are you sure?",
//       text: "Once blocked, the user won't be able to access the system.",
//       icon: "warning",
//       buttons: true,
//       dangerMode: true,
//     })
//     .then((willBlock) => {
//       if (willBlock) {
//         // Perform block action
//         fetch('/admin/block-user?id=' + userId, {
//           method: 'POST'
//         })
//         .then(response => response.json())
//         .then(data => {
//           if (data.success) {
//             // Update button text
//             var button = document.getElementById("blockButton_" + userId);
//             button.innerText = "Unblock";
//             button.setAttribute("onclick", "confirmUnblock('" + userId + "')");
//             swal("User blocked successfully.");
//             window.reload()
//           } 
//           else {
//             swal("blocked the  user.");
//           }
//         })
//         .catch(error => {
//           console.error('Error:', error);
//           swal("blocked the    user.");
//         });
//       }
//     });
//   }
function confirmBlock(userId) {
  swal({
      title: "Are you sure?",
      text: "Once blocked, the user won't be able to access the system.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
  })
  .then((willBlock) => {
      if (willBlock) {
          // Perform block action
          fetch('/admin/block-user?id=' + userId, {
              method: 'POST'
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  // Update button text
                  var button = document.getElementById("blockButton_" + userId);
                  button.innerText = "Unblock";
                  button.setAttribute("onclick", "confirmUnblock('" + userId + "')");
                  swal("User blocked successfully.")
                  .then(() => {
                      window.location.reload();
                  });
              } else {
                  swal("Unable to block the user.");
              }
          })
          .catch(error => {
              console.error('Error:', error);
              swal("Unable to block the user.");
          });
      }
  });
}

  
  function confirmUnblock(userId) {
    swal({
      title: "Are you sure?",
      text: "Once unblocked, the user will be able to access the system.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willUnblock) => {
      if (willUnblock) {
        // Perform unblock action
        fetch('/admin/unblock-user?id=' + userId, {
          method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Update button text
            var button = document.getElementById("blockButton_" + userId);
            button.innerText = "Block";
            button.setAttribute("onclick", "confirmBlock('" + userId + "')");
            swal("User unblocked successfully.");
          } 
          else {
            swal("unblocked the user.");
          }
        })
        .catch(error => {
          console.error('Error:', error);
          swal("unblocked the user.");
        });
      }
    });
  }


function confirmDelete(userId) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you won't be able to recover this user!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            // Redirect to delete action
            window.location.href = "/admin/delete-user?id=" + userId;
        } else {
            swal("User was not deleted.");
        }
    });
}
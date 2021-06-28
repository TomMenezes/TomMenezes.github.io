var bairesdev = {
    btracker: {
        dashboard: {
            hoursDashboard: [],
            taskId: '',
            scrollTopDashboard: 0,
            currentWeek: {
                start: null,
                end: null
            },
            previousWeek: () => {
                bairesdev.btracker.dashboard.currentWeek.start.setDate(bairesdev.btracker.dashboard.currentWeek.start.getDate() - 7);
                bairesdev.btracker.dashboard.currentWeek.end.setDate(bairesdev.btracker.dashboard.currentWeek.end.getDate() - 7);
                bairesdev.btracker.dashboard.fillDashboard();
            },
            nextWeek: () => {
                bairesdev.btracker.dashboard.currentWeek.start.setDate(bairesdev.btracker.dashboard.currentWeek.start.getDate() + 7);
                bairesdev.btracker.dashboard.currentWeek.end.setDate(bairesdev.btracker.dashboard.currentWeek.end.getDate() + 7);
                bairesdev.btracker.dashboard.fillDashboard();
            },
            saveTask: (task) => {
                task.id = bairesdev.btracker.dashboard.taskId;
                if (bairesdev.btracker.dashboard.isValid(task)) {
                    if (task.id == '') task.id = bairesdev.btracker.dashboard.newId();
                    bairesdev.btracker.dashboard.data.dashboardData.push(task);
                    bairesdev.btracker.dashboard.fillDashboard();
                    $('#new-task').addClass('hide');
                    $('#dashboard-items div').removeClass('over');
                }
            },
            removeTask: () => {
                if (bairesdev.btracker.dashboard.taskId != '') {
                    for (var i = 0; i < bairesdev.btracker.dashboard.data.dashboardData.length; i++) {
                        var item = bairesdev.btracker.dashboard.data.dashboardData[i];
                        if (item.id == bairesdev.btracker.dashboard.taskId) {
                            bairesdev.btracker.dashboard.data.dashboardData.splice(i, 1);
                            bairesdev.btracker.dashboard.fillDashboard();
                            break;
                        }
                    }
                }
                $('#new-task').addClass('hide');
                $('#dashboard-items div').removeClass('over');
            },
            newId: () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            isValid: (task) => {
                if (task.endDate <= task.startDate) {
                    $('#error-container').removeClass('hide');
                    $("#groupStartDate").addClass("has-error");
                    $("#groupEndDate").addClass("has-error");
                    $('#lblErrorTask').html('End time need to be greater then start time.')
                    return false;
                }

                for (var i = 0; i < bairesdev.btracker.dashboard.data.dashboardData.length; i++) {
                    var item = bairesdev.btracker.dashboard.data.dashboardData[i];
                    if (item.id == task.id) continue;
                    if (
                        (item.startDate.getTime() < task.startDate.getTime() && item.endDate.getTime() > task.startDate.getTime()) ||
                        (item.endDate.getTime() > task.endDate.getTime() && item.startDate.getTime() < task.endDate.getTime()) ||
                        item.startDate.getTime() == task.startDate.getTime() ||
                        item.endDate.getTime() == task.endDate.getTime()
                    ) {
                        $('#error-container').removeClass('hide');
                        $("#groupStartDate").addClass("has-error");
                        $("#groupEndDate").addClass("has-error");
                        $('#lblErrorTask').html('There are time conflicts between new task and the registers tasks.')
                        return false;
                    }
                }
                return true;
            },
            start: () => {
                var curr = new Date; // get current date
                var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
                var last = first + 6; // last day is the first day + 6
                bairesdev.btracker.dashboard.currentWeek.start = new Date(curr.setDate(first));
                var end = new Date(curr.setDate(last));
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
                bairesdev.btracker.dashboard.currentWeek.end = end;
                bairesdev.btracker.dashboard.fillDashboard();
            },
            fillDashboard: () => {
                bairesdev.btracker.dashboard.scrollTopDashboard = 0;
                bairesdev.btracker.dashboard.hoursDashboard = [];
                $("#dashboard-values").empty();

                for (var i = 0; i < bairesdev.btracker.dashboard.data.dashboardData.length; i++) {
                    var item = bairesdev.btracker.dashboard.data.dashboardData[i];
                    if (item.startDate >= bairesdev.btracker.dashboard.currentWeek.start && item.endDate <= bairesdev.btracker.dashboard.currentWeek.end) {
                        bairesdev.btracker.dashboard.insertDashboardItem(item);
                    }
                }

                var spanZeroHours = "<span>0/8 HRS</span>";
                $("#hour_sun,#hour_mon,#hour_tue,#hour_wed,#hour_thu,#hour_fri,#hour_sat").html(spanZeroHours);
                for (var i = 0; i < bairesdev.btracker.dashboard.hoursDashboard.length; i++) {
                    var item = bairesdev.btracker.dashboard.hoursDashboard[i];
                    var hours = "<span>" + (item.totalminutes / 60).toString() + "/8 HRS</span>";
                    $("#hour_" + bairesdev.btracker.dashboard.data.weekDayData[item.day]).html(hours);
                }

                var startDateDayType = bairesdev.btracker.dashboard.currentWeek.start.getDate() - 1;
                if (startDateDayType > 3) startDateDayType = 3;
                var startDate = bairesdev.btracker.dashboard.data.monthData[bairesdev.btracker.dashboard.currentWeek.start.getMonth()] + " " + bairesdev.btracker.dashboard.currentWeek.start.getDate().toString() + bairesdev.btracker.dashboard.data.dayData[startDateDayType];
                var endDateDayType = bairesdev.btracker.dashboard.currentWeek.end.getDate() - 1;
                if (endDateDayType > 3) endDateDayType = 3;
                var endDate = bairesdev.btracker.dashboard.data.monthData[bairesdev.btracker.dashboard.currentWeek.end.getMonth()] + " " + bairesdev.btracker.dashboard.currentWeek.end.getDate().toString() + bairesdev.btracker.dashboard.data.dayData[endDateDayType];
                $('#lblFiltersInfo').text(startDate + " to " + endDate);
                $("#dashboard-values > .card").dblclick((e, h) => {
                    var task = bairesdev.btracker.dashboard.getItem($(e.currentTarget).attr('task-id'));
                    if (task != null) {
                        var hour = task.startDate.getHours();
                        var minute = task.startDate.getMinutes();
                        var hourEnd = task.endDate.getHours();
                        var minuteEnd = task.endDate.getMinutes();
                        var ampm = ' AM';
                        if (hour > 11) {
                            hour -= 12;
                            ampm = ' PM';
                        }
                        task.startTime = hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ampm;
                        if (hourEnd > 11) {
                            hourEnd -= 12;
                            ampm = ' PM';
                        }
                        task.endTime = hourEnd.toString().padStart(2, '0') + ':' + minuteEnd.toString().padStart(2, '0') + ampm;
                        var date = new Date(task.startDate);
                        task.date = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0') + '/' + date.getFullYear().toString();

                        bairesdev.btracker.dashboard.openTask(task);
                    }
                });
                if (bairesdev.btracker.dashboard.scrollTopDashboard == 0)
                    document.getElementById('dashboard-items').scrollTop = 400;
                else
                    document.getElementById('dashboard-items').scrollTop = bairesdev.btracker.dashboard.scrollTopDashboard;
            },
            getItem: (id) => {
                for (var i = 0; i < bairesdev.btracker.dashboard.data.dashboardData.length; i++) {
                    var item = bairesdev.btracker.dashboard.data.dashboardData[i];
                    if (item.id == id) {
                        return item;
                    }
                }
                return null;
            },
            insertDashboardItem: (item) => {
                //sample card 
                // top:400px distance relative start times on board which 50px is one hour distance
                // height: 147px; max-height: 147px height 
                // <div class="card wed" style="height: 147px; max-height: 147px; overflow:hidden;top:400px;">
                //     <div class="title">Task 1</div>
                //     <div class="time">03:00</div>
                //     <div class="description">Instaling tools and setting up the project environment.</div>
                // </div>
                var cardHeight = bairesdev.btracker.dashboard.cardHeight(item);
                var card = "<div class=\"card ";
                card += bairesdev.btracker.dashboard.weekDay(item);
                card += "\" " + "task-id=\"" + item.id + "\" ";
                card += " style=\"height: ";
                card += cardHeight;
                card += "; max-height: ";
                card += cardHeight;
                card += "; overflow:hidden;top:";
                card += bairesdev.btracker.dashboard.cardTop(item);
                card += ";\"><div class=\"title\">";
                card += item.title;
                card += "</div><div class=\"time\">";
                card += bairesdev.btracker.dashboard.cardTime(item);
                card += "</div><div class=\"description\">";
                card += item.description;
                card += "</div></div>";
                $(card).appendTo("#dashboard-values");
                bairesdev.btracker.dashboard.setTimeDashboard(item);
            },
            setTimeDashboard: (item) => {
                var dashItem = { day: item.startDate.getDay(), totalminutes: 0 };
                var foundItem = -1;
                for (var i = 0; i < bairesdev.btracker.dashboard.hoursDashboard.length; i++) {
                    if (bairesdev.btracker.dashboard.hoursDashboard[i].day == dashItem.day) {
                        dashItem = bairesdev.btracker.dashboard.hoursDashboard[i];
                        foundItem = i;
                        break;
                    }
                }
                dashItem.totalminutes += Math.floor((item.endDate - item.startDate) / (60 * 1000));
                if (foundItem > -1)
                    bairesdev.btracker.dashboard.hoursDashboard[foundItem] = dashItem;
                else
                    bairesdev.btracker.dashboard.hoursDashboard.push(dashItem);
            },
            cardTop: (item) => {
                var dateInitial = new Date(item.startDate.getFullYear(), item.startDate.getMonth(), item.startDate.getDate());
                var minutes = Math.floor((item.startDate - dateInitial) / (60 * 1000));
                var itemTop = (minutes * 50 / 60);
                if (bairesdev.btracker.dashboard.scrollTopDashboard > itemTop || bairesdev.btracker.dashboard.scrollTopDashboard == 0)
                    bairesdev.btracker.dashboard.scrollTopDashboard = itemTop;
                return itemTop.toString() + "px";
            },
            cardHeight: (item) => {
                var minutes = Math.floor((item.endDate - item.startDate) / (60 * 1000));
                var heightItem = (minutes * 50 / 60) - 2;
                return heightItem.toString() + "px";
            },
            weekDay: (item) => {
                return bairesdev.btracker.dashboard.data.weekDayData[item.startDate.getDay()];
            },
            cardTime: (item) => {
                var totalMinutes = Math.floor((item.endDate - item.startDate) / (60 * 1000));
                var minutes = totalMinutes % 60;
                var hours = Math.floor(totalMinutes / 60);
                return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');
            },
            openTask: (task) => {
                clearTaskForm();
                bairesdev.btracker.dashboard.taskId = task.id;
                document.getElementById('txtStartTime').value = task.startTime;
                document.getElementById('txtEndTime').value = task.endTime;
                document.getElementById('txtDate').value = task.date;
                $('#taskTitle').html(task.title);
                bairesdev.btracker.dashboard.fillWorkspace(task.workspace);
                bairesdev.btracker.dashboard.fillProject(task.project);
                bairesdev.btracker.dashboard.fillFocalPoint(task.focalpoint);
                document.getElementById('txtComment').value = task.description;
                $('#new-task').removeClass('hide');
            },
            fillWorkspace: (workspace) => {
                if (workspace == "") workspace = bairesdev.btracker.dashboard.data.workspaces[0];
                var groupWorkspace = $("#groupWorkspace");
                groupWorkspace.empty();
                $(bairesdev.btracker.dashboard.data.workspaces).each((idx, workspaceData) => {
                    var html = workspace == workspaceData ? "<span class=\"item-workspace selected\">" : "<span class=\"item-workspace\">";
                    html += workspaceData;
                    html += "</span>";
                    $(html).appendTo(groupWorkspace);
                    first = false;
                });

                $('.item-workspace').click((event) => {
                    $('.item-workspace').removeClass('selected');
                    $('#groupWorkspace').removeClass('has-error');
                    $(event.target).addClass('selected');
                    bairesdev.btracker.dashboard.fillProject('');
                    bairesdev.btracker.dashboard.fillFocalPoint('');
                });
            },
            fillProject: (project) => {
                if (project == '') project = "Project (Client)";
                var listProject = $("#listProject");
                listProject.empty();
                var workspace = $("#groupWorkspace > .selected").text();
                $(bairesdev.btracker.dashboard.data.projects[workspace]).each((idx, projectData) => {
                    var html = "<li><a href=\"javascript:void(0)\" title=\"" + projectData + " (" + workspace + ")\">" + projectData + " (" + workspace + ")</a></li>";
                    $(html).appendTo(listProject);
                    if (project == projectData || bairesdev.btracker.dashboard.data.projects[workspace].length == 1) project = projectData + " (" + workspace + ")";
                });
                $('#txtProject').html(project);
                console.log(project);

                $(".dropdown-menu li a").click(function () {
                    $(".btn > .title:first-child").text($(this).text());
                    $(".btn > .title:first-child").val($(this).text());
                    $('#groupProject').removeClass('has-error');
                });
            },
            fillFocalPoint: (focalpoint) => {
                var groupFocalPoint = $("#groupFocalPoint");
                groupFocalPoint.empty();
                var workspace = $("#groupWorkspace > .selected").text();
                $(bairesdev.btracker.dashboard.data.focalPoints[workspace]).each((idx, focalpointData) => {
                    var html = focalpoint == focalpointData || bairesdev.btracker.dashboard.data.focalPoints[workspace].length == 1 ? "<span class=\"item-focalpoint selected\">" : "<span class=\"item-focalpoint\">";
                    html += focalpointData;
                    html += "</span>";
                    $(html).appendTo(groupFocalPoint);
                });
                $("<span class=\"help-block\">Select focal point</span>").appendTo(groupFocalPoint);

                $('.item-focalpoint').click((event) => {
                    $('.item-focalpoint').removeClass('selected');
                    $('#groupFocalPoint').removeClass('has-error');
                    $(event.target).addClass('selected');
                });
            },
            data: {
                weekDayData: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
                monthData: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                dayData: ["st", "nd", "rd", "th"],
                workspaces: ["Abbott", "Adobe", "BairesDev"],
                focalPoints: {
                    "Abbott": ["Michael Helmick", "Ximena Dominguez"],
                    "Adobe": ["Javier Viala", "Vivian Torres"],
                    "BairesDev": ["Juliana Ponzio"],
                },
                projects: {
                    "Abbott": ["Staff Augmentation", "Phoenix", "Standart"],
                    "Adobe": ["Photoshop", "Reader"],
                    "BairesDev": ["Btracker"],
                },
                dashboardData: [
                    {
                        "id": "bc1fc868-226d-4aa3-be25-3d082ee8f286",
                        "startDate": new Date("2021-06-01 10:00"),
                        "endDate": new Date("2021-06-01 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "recording meetings Golang Training 01-01",
                    },
                    {
                        "id": "9f24ceb5-b0f2-4e00-aba0-879c3b150f73",
                        "startDate": new Date("2021-06-01 11:00"),
                        "endDate": new Date("2021-06-01 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "recording meetings Salesforce 01-01",
                    },
                    {
                        "id": "a30d016b-96c2-4c74-986d-88edb93f2d68",
                        "startDate": new Date("2021-06-01 12:00"),
                        "endDate": new Date("2021-06-01 12:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "compliancewire-Confluence Instructions",
                    },
                    {
                        "id": "9a1c3c8f-ea2d-4e14-ab70-c44a63ca1a4e",
                        "startDate": new Date("2021-06-01 12:30"),
                        "endDate": new Date("2021-06-01 13:10"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Instructions",
                    },
                    {
                        "id": "0472a528-f8f3-48ae-b0c3-0c6434cf6cc5",
                        "startDate": new Date("2021-06-01 14:10"),
                        "endDate": new Date("2021-06-01 14:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Quality Policy",
                    },
                    {
                        "id": "b7b9c858-53db-457b-a9d1-54fd7a8dd52d",
                        "startDate": new Date("2021-06-01 14:30"),
                        "endDate": new Date("2021-06-01 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Quality Manual",
                    },
                    {
                        "id": "e8b47d2d-d0f8-416a-a567-3c791001ed8e",
                        "startDate": new Date("2021-06-01 15:00"),
                        "endDate": new Date("2021-06-01 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Document Controls",
                    },
                    {
                        "id": "a46a141c-46ea-4edd-8897-fc92e8f62b33",
                        "startDate": new Date("2021-06-01 16:00"),
                        "endDate": new Date("2021-06-01 16:20"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Training",
                    },
                    {
                        "id": "c43d2105-5634-41a8-abe1-29665740557f",
                        "startDate": new Date("2021-06-01 16:20"),
                        "endDate": new Date("2021-06-01 16:50"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Feedback and Complaint Handling",
                    },
                    {
                        "id": "b8a390dd-e640-4acf-b0c9-7470d7dcac3b",
                        "startDate": new Date("2021-06-01 16:50"),
                        "endDate": new Date("2021-06-01 17:20"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire External Audit",
                    },
                    {
                        "id": "15ad25be-6120-4ce6-abbb-f2c0d73e4ad2",
                        "startDate": new Date("2021-06-01 17:20"),
                        "endDate": new Date("2021-06-01 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Vigilance, Reporting and Recalls",
                    },
                    {
                        "id": "83583c4f-6c1e-4862-84ea-a2159c7fdc8c",
                        "startDate": new Date("2021-06-01 18:00"),
                        "endDate": new Date("2021-06-01 18:25"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Good Documentation Practices",
                    },
                    {
                        "id": "eeea69d7-9088-49a9-a1c1-c4c2fa8b0317",
                        "startDate": new Date("2021-06-01 18:25"),
                        "endDate": new Date("2021-06-01 18:35"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire QualityOne Instructions",
                    },
                    {
                        "id": "f0403f91-d99f-4573-94ba-acd394c8d3fa",
                        "startDate": new Date("2021-06-01 18:35"),
                        "endDate": new Date("2021-06-01 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire CAPA",
                    },
                    {
                        "id": "8980ad68-54c3-4765-aa5d-5ce86ef865d8",
                        "startDate": new Date("2021-06-01 19:00"),
                        "endDate": new Date("2021-06-01 19:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Risk Management",
                    },
                    {
                        "id": "2a306d73-018c-4ef3-b856-f99c165e4c79",
                        "startDate": new Date("2021-06-01 19:30"),
                        "endDate": new Date("2021-06-01 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Jira Instructions",
                    },
                    {
                        "id": "95d49bfc-1045-4c2d-853b-7061cc6a68b1",
                        "startDate": new Date("2021-06-02 10:00"),
                        "endDate": new Date("2021-06-02 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Design Controls - 01",
                    },
                    {
                        "id": "a0b3b32a-003c-48bf-976f-69faf76ae03c",
                        "startDate": new Date("2021-06-02 11:00"),
                        "endDate": new Date("2021-06-02 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Design Controls - 02",
                    },
                    {
                        "id": "42c413c2-2afd-4e0a-8803-8be42a166007",
                        "startDate": new Date("2021-06-02 12:00"),
                        "endDate": new Date("2021-06-02 12:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Jira Bug and Defect Management",
                    },
                    {
                        "id": "0816953b-1558-4846-aead-0ab669bf8114",
                        "startDate": new Date("2021-06-02 12:30"),
                        "endDate": new Date("2021-06-02 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Bitbucket Instructions",
                    },
                    {
                        "id": "e4309ec5-e499-406a-bd12-a60ddc702cb9",
                        "startDate": new Date("2021-06-02 14:00"),
                        "endDate": new Date("2021-06-02 14:50"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire LibreView Overview-HCP",
                    },
                    {
                        "id": "bff28b73-cbec-4e86-a8a0-ed334f5fb857",
                        "startDate": new Date("2021-06-02 14:50"),
                        "endDate": new Date("2021-06-02 15:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire LibreLinkUp",
                    },
                    {
                        "id": "504fbad8-f91e-47c7-995b-782c4163d71a",
                        "startDate": new Date("2021-06-02 15:30"),
                        "endDate": new Date("2021-06-02 16:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire LibreLinkUp v4.0 Product",
                    },
                    {
                        "id": "6ba6dc0a-249a-412e-b3c6-ceb46410656e",
                        "startDate": new Date("2021-06-02 16:30"),
                        "endDate": new Date("2021-06-02 17:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire FreeStyle Libre 2 Product Training",
                    },
                    {
                        "id": "a1b96043-0b57-45b1-b790-22069ede60b4",
                        "startDate": new Date("2021-06-02 17:30"),
                        "endDate": new Date("2021-06-02 18:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Compliance LibreView 3.7 Release Training",
                    },
                    {
                        "id": "7f9ad02c-af99-4714-8a90-8f832047f904",
                        "startDate": new Date("2021-06-02 18:30"),
                        "endDate": new Date("2021-06-02 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire LibreLinkUp Release 4.1",
                    },
                    {
                        "id": "1a40e895-2497-4d28-a808-599798ded406",
                        "startDate": new Date("2021-06-02 19:00"),
                        "endDate": new Date("2021-06-02 19:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Privacy and Security SOP-15",
                    },
                    {
                        "id": "a3a9afb4-f7a7-4257-b474-0145cfff8d4d",
                        "startDate": new Date("2021-06-02 19:30"),
                        "endDate": new Date("2021-06-02 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Information Security Governance Policy",
                    },
                    {
                        "id": "bf0d63cf-f213-46cb-816e-c1a381258bf4",
                        "startDate": new Date("2021-06-03 10:00"),
                        "endDate": new Date("2021-06-03 10:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Acceptable Use Policy",
                    },
                    {
                        "id": "19ecc987-c974-4202-9e6d-c3c616b72bc1",
                        "startDate": new Date("2021-06-03 10:30"),
                        "endDate": new Date("2021-06-03 10:42"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Teleworking Security Policy",
                    },
                    {
                        "id": "4734f062-9de2-44fb-8543-6309e8964fbf",
                        "startDate": new Date("2021-06-03 10:42"),
                        "endDate": new Date("2021-06-03 11:06"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Physical and Environmental Security Policy",
                    },
                    {
                        "id": "dd9088eb-f030-4b71-a74d-65b66cb6934f",
                        "startDate": new Date("2021-06-03 11:06"),
                        "endDate": new Date("2021-06-03 11:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Computing & Mobile Device Security Policy",
                    },
                    {
                        "id": "97762f1d-a33a-49c7-8f9f-96553655ecb1",
                        "startDate": new Date("2021-06-03 11:30"),
                        "endDate": new Date("2021-06-03 11:54"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Privileged Users",
                    },
                    {
                        "id": "889e8800-8615-4519-a633-50756fca0e3d",
                        "startDate": new Date("2021-06-03 11:54"),
                        "endDate": new Date("2021-06-03 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Password Policy",
                    },
                    {
                        "id": "ec23bf74-8b17-4102-8c60-32cb789386f5",
                        "startDate": new Date("2021-06-03 12:00"),
                        "endDate": new Date("2021-06-03 12:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Data Protection & Information Handling Policy",
                    },
                    {
                        "id": "c801ad51-b996-4693-8ee9-5ac927121c2f",
                        "startDate": new Date("2021-06-03 12:30"),
                        "endDate": new Date("2021-06-03 12:54"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Information Handling Procedure",
                    },
                    {
                        "id": "3d97d60b-3500-4148-8bd5-8554a73d3301",
                        "startDate": new Date("2021-06-03 13:54"),
                        "endDate": new Date("2021-06-03 14:12"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Information Handling: PII/PHI Data Processing and Storage",
                    },
                    {
                        "id": "ca09cf74-f57a-4dca-a7b7-2163446fd247",
                        "startDate": new Date("2021-06-03 14:12"),
                        "endDate": new Date("2021-06-03 14:36"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Security Awareness Fundamentals",
                    },
                    {
                        "id": "e3233d18-5d31-4798-bbd7-0e086f1c5354",
                        "startDate": new Date("2021-06-03 14:36"),
                        "endDate": new Date("2021-06-03 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Business Continuity & Disaster Recovery Plan",
                    },
                    {
                        "id": "cfaff303-b610-4ef6-8eba-62b03f4f5a40",
                        "startDate": new Date("2021-06-03 15:00"),
                        "endDate": new Date("2021-06-03 15:24"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Incident Response Plan",
                    },
                    {
                        "id": "067fce59-57f6-424b-92a1-3443bbb99a91",
                        "startDate": new Date("2021-06-03 15:24"),
                        "endDate": new Date("2021-06-03 16:06"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire GDPR Compliance Module",
                    },
                    {
                        "id": "3e78bb3d-1e8a-4f0f-bde2-f582a8b88cf2",
                        "startDate": new Date("2021-06-03 16:06"),
                        "endDate": new Date("2021-06-03 16:48"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire HIPAA",
                    },
                    {
                        "id": "f53e53b6-974b-4bea-a034-1dc876f1e8c8",
                        "startDate": new Date("2021-06-03 16:48"),
                        "endDate": new Date("2021-06-03 17:06"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Freestyle Libre 3 Overview",
                    },
                    {
                        "id": "c4f6d874-9430-4629-84f2-0d51982d1b7e",
                        "startDate": new Date("2021-06-03 17:06"),
                        "endDate": new Date("2021-06-03 17:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "ComplianceWire Password Policy and Access Control Quiz",
                    },
                    {
                        "id": "0ab91876-53c9-41c4-86f6-ec13b1aafc5c",
                        "startDate": new Date("2021-06-03 17:30"),
                        "endDate": new Date("2021-06-03 18:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 03-01",
                    },
                    {
                        "id": "e8fd896a-347e-4293-a994-c24093166231",
                        "startDate": new Date("2021-06-03 18:30"),
                        "endDate": new Date("2021-06-03 19:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 03-02",
                    },
                    {
                        "id": "ccd2849e-412b-4611-abfe-231b3c24cc39",
                        "startDate": new Date("2021-06-03 19:30"),
                        "endDate": new Date("2021-06-03 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 03-02.5",
                    },
                    {
                        "id": "2e846dd9-3c45-4fc4-9e3e-49fafe1e2614",
                        "startDate": new Date("2021-06-04 10:00"),
                        "endDate": new Date("2021-06-04 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-01",
                    },
                    {
                        "id": "2c55d0e1-fa98-4206-b5d2-ac1fdcacb4b9",
                        "startDate": new Date("2021-06-04 11:00"),
                        "endDate": new Date("2021-06-04 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-02",
                    },
                    {
                        "id": "5bdcdff7-4d33-4624-9624-fbb1ac7ecd53",
                        "startDate": new Date("2021-06-04 12:00"),
                        "endDate": new Date("2021-06-04 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-03",
                    },
                    {
                        "id": "a786ef39-e888-4ac1-8fcb-56e210e4f8d5",
                        "startDate": new Date("2021-06-04 14:00"),
                        "endDate": new Date("2021-06-04 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-04",
                    },
                    {
                        "id": "340cd022-0a8f-435a-a36a-7c614990d220",
                        "startDate": new Date("2021-06-04 15:00"),
                        "endDate": new Date("2021-06-04 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-05",
                    },
                    {
                        "id": "f3f8f2d0-8206-4557-a68a-82e5709fe1b7",
                        "startDate": new Date("2021-06-04 16:00"),
                        "endDate": new Date("2021-06-04 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-06",
                    },
                    {
                        "id": "7f23366c-4415-492a-b417-ee595ca968b3",
                        "startDate": new Date("2021-06-04 17:00"),
                        "endDate": new Date("2021-06-04 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure AWS Dev Environment 04-07",
                    },
                    {
                        "id": "8077377f-31e1-466b-90a1-6c8ed34006fc",
                        "startDate": new Date("2021-06-04 18:00"),
                        "endDate": new Date("2021-06-04 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG Training NSQ 04-01",
                    },
                    {
                        "id": "7c69ba10-6378-4e1a-b1c3-763b7fe1a627",
                        "startDate": new Date("2021-06-04 19:00"),
                        "endDate": new Date("2021-06-04 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG Training NSQ 04-02",
                    },
                    {
                        "id": "1d4a017b-5138-408f-8278-cce08e5efc1c",
                        "startDate": new Date("2021-06-07 10:00"),
                        "endDate": new Date("2021-06-07 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang training - create producer and consumer NSQ 07-01",
                    },
                    {
                        "id": "f6b004cf-f377-45a9-a6dd-2a9b040f73f1",
                        "startDate": new Date("2021-06-07 11:00"),
                        "endDate": new Date("2021-06-07 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang training - create producer and consumer NSQ 07-02",
                    },
                    {
                        "id": "8183c01e-efa8-4ea2-b756-dcc3297f6048",
                        "startDate": new Date("2021-06-07 12:00"),
                        "endDate": new Date("2021-06-07 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang training - create producer and consumer NSQ 07-03",
                    },
                    {
                        "id": "dc6abbe8-fc27-4855-9eff-8a0160cc8851",
                        "startDate": new Date("2021-06-07 14:00"),
                        "endDate": new Date("2021-06-07 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang training - create producer and consumer NSQ 07-04",
                    },
                    {
                        "id": "a5310ab3-6e5a-47d5-ad2b-531b97739c7e",
                        "startDate": new Date("2021-06-07 15:00"),
                        "endDate": new Date("2021-06-07 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang training - connect SQL Management Studio 07",
                    },
                    {
                        "id": "9731f896-afca-4010-957e-6f0c2c5a06be",
                        "startDate": new Date("2021-06-07 16:00"),
                        "endDate": new Date("2021-06-07 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang training - multiples channels NSQ 07",
                    },
                    {
                        "id": "6a6cb4fb-d26f-4c43-b463-767f3ce3415e",
                        "startDate": new Date("2021-06-07 17:00"),
                        "endDate": new Date("2021-06-07 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Configure Postman FSLL",
                    },
                    {
                        "id": "550fa2b5-da11-4ab6-af61-fb5dbb6a60d5",
                        "startDate": new Date("2021-06-07 18:00"),
                        "endDate": new Date("2021-06-07 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 07-01",
                    },
                    {
                        "id": "cd6f0055-eac7-4cc8-9bfa-3896b8f6fe2e",
                        "startDate": new Date("2021-06-07 19:00"),
                        "endDate": new Date("2021-06-07 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 07-02",
                    },
                    {
                        "id": "767e63d4-5821-4e0d-8fed-8ceb17a6057d",
                        "startDate": new Date("2021-06-08 10:00"),
                        "endDate": new Date("2021-06-08 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 08-01",
                    },
                    {
                        "id": "e19e04c0-e6b8-4ee1-91db-663e5d72709f",
                        "startDate": new Date("2021-06-08 11:00"),
                        "endDate": new Date("2021-06-08 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 08-02",
                    },
                    {
                        "id": "5b056d50-0556-44fa-9eed-afa0b21dac23",
                        "startDate": new Date("2021-06-08 12:00"),
                        "endDate": new Date("2021-06-08 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 08-03",
                    },
                    {
                        "id": "e11c85cb-82e8-41a5-ab93-6d0445f1cfac",
                        "startDate": new Date("2021-06-08 14:00"),
                        "endDate": new Date("2021-06-08 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 08-04",
                    },
                    {
                        "id": "874d9f55-f752-4786-bca2-781ea17f4304",
                        "startDate": new Date("2021-06-08 15:00"),
                        "endDate": new Date("2021-06-08 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 08-05",
                    },
                    {
                        "id": "822969df-adc7-4ccd-8da0-de72c0a3a291",
                        "startDate": new Date("2021-06-08 16:00"),
                        "endDate": new Date("2021-06-08 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing LibreView Localhost 08-06",
                    },
                    {
                        "id": "f1b3fde8-6329-4c58-9e36-89c3b85ada9a",
                        "startDate": new Date("2021-06-08 17:00"),
                        "endDate": new Date("2021-06-08 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking how react libreview works 08-01",
                    },
                    {
                        "id": "0af38ed8-0f30-43a7-bd3d-58d0fb9cdefc",
                        "startDate": new Date("2021-06-08 18:00"),
                        "endDate": new Date("2021-06-08 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking how react libreview works 08-02",
                    },
                    {
                        "id": "e28bffb0-355c-42e8-bcdf-ce03cf55e430",
                        "startDate": new Date("2021-06-08 19:00"),
                        "endDate": new Date("2021-06-08 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking how react libreview works 08-03",
                    },
                    {
                        "id": "1d1638fe-c9db-4b8d-865e-07a0c867c7ef",
                        "startDate": new Date("2021-06-09 10:00"),
                        "endDate": new Date("2021-06-09 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards project-layout 09-01",
                    },
                    {
                        "id": "b9cc784c-92dd-4a0d-953c-dd6654bc06f9",
                        "startDate": new Date("2021-06-09 11:00"),
                        "endDate": new Date("2021-06-09 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards project-layout 09-02",
                    },
                    {
                        "id": "d669ba89-6f64-4f8a-b1fa-3260136be0ee",
                        "startDate": new Date("2021-06-09 12:00"),
                        "endDate": new Date("2021-06-09 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards project-layout 09-03",
                    },
                    {
                        "id": "2aea4f83-b91e-4c5f-a155-11f4514bbe94",
                        "startDate": new Date("2021-06-09 14:00"),
                        "endDate": new Date("2021-06-09 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Guiding Principles 09-01",
                    },
                    {
                        "id": "732af593-92e2-4660-810d-83e5a65a67d8",
                        "startDate": new Date("2021-06-09 15:00"),
                        "endDate": new Date("2021-06-09 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Guiding Principles 09-02",
                    },
                    {
                        "id": "2dd5307a-9632-4405-a23e-51cafdaa4b3c",
                        "startDate": new Date("2021-06-09 16:00"),
                        "endDate": new Date("2021-06-09 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Guiding Principles 09-03",
                    },
                    {
                        "id": "4905583a-454a-48e2-8d10-6f31a3e3e512",
                        "startDate": new Date("2021-06-09 17:00"),
                        "endDate": new Date("2021-06-09 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Naming Conventions 09-01",
                    },
                    {
                        "id": "4e450110-40a4-437f-a3b4-890e2b0d2770",
                        "startDate": new Date("2021-06-09 18:00"),
                        "endDate": new Date("2021-06-09 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Error Handling 09-01",
                    },
                    {
                        "id": "2a489f53-bb73-479b-b10a-5bab294d5390",
                        "startDate": new Date("2021-06-09 19:00"),
                        "endDate": new Date("2021-06-09 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Error Handling 09-02",
                    },
                    {
                        "id": "ce8776c9-28d8-480b-ba1f-03dfdfa2ff0b",
                        "startDate": new Date("2021-06-10 10:00"),
                        "endDate": new Date("2021-06-10 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Error Handling Failure 10-01",
                    },
                    {
                        "id": "c6ee8ef2-49a8-4659-aa5a-529c9a86c1de",
                        "startDate": new Date("2021-06-10 11:00"),
                        "endDate": new Date("2021-06-10 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "GOLANG+Development+Standards Error Handling Failure 10-02",
                    },
                    {
                        "id": "3715b9ad-8c5a-4c31-a143-2cba860bce82",
                        "startDate": new Date("2021-06-10 12:00"),
                        "endDate": new Date("2021-06-10 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking at react calls api make some POSTMAN 10-01",
                    },
                    {
                        "id": "e596b6df-37f0-4a5c-b505-620d17aa2e3e",
                        "startDate": new Date("2021-06-10 14:00"),
                        "endDate": new Date("2021-06-10 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking at react calls api make some POSTMAN 10-02",
                    },
                    {
                        "id": "cd9aff33-10c8-4853-a73f-f03b7879a8cc",
                        "startDate": new Date("2021-06-10 15:00"),
                        "endDate": new Date("2021-06-10 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking at react calls api make some POSTMAN 10-03",
                    },
                    {
                        "id": "c867a748-e4a0-469d-aa25-c478a875eefb",
                        "startDate": new Date("2021-06-10 16:00"),
                        "endDate": new Date("2021-06-10 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 10-01",
                    },
                    {
                        "id": "d82af674-1453-457d-a5a1-7f6325fb9b6d",
                        "startDate": new Date("2021-06-10 17:00"),
                        "endDate": new Date("2021-06-10 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 10-02",
                    },
                    {
                        "id": "5617806c-6d1f-41a3-b8e1-1e557c7e1996",
                        "startDate": new Date("2021-06-10 18:00"),
                        "endDate": new Date("2021-06-10 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing Deployment tests on Dev environment 10-01",
                    },
                    {
                        "id": "b712a169-ae67-4024-86e9-268de053b22c",
                        "startDate": new Date("2021-06-10 19:00"),
                        "endDate": new Date("2021-06-10 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing Deployment tests on Dev environment 10-02",
                    },
                    {
                        "id": "d83956b2-1922-481b-88b3-db6e3717a64f",
                        "startDate": new Date("2021-06-11 10:00"),
                        "endDate": new Date("2021-06-11 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing Deployment tests on Dev environment 11-01",
                    },
                    {
                        "id": "e297c283-76ff-444e-b22b-1b0727380dd8",
                        "startDate": new Date("2021-06-11 11:00"),
                        "endDate": new Date("2021-06-11 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing Deployment tests on Dev environment 11-02",
                    },
                    {
                        "id": "b2344a12-28c8-460d-911a-11260551c32d",
                        "startDate": new Date("2021-06-11 12:00"),
                        "endDate": new Date("2021-06-11 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing Deployment tests on Dev environment 11-03",
                    },
                    {
                        "id": "8264c3f7-a9b6-4478-9c74-593dc7e444b0",
                        "startDate": new Date("2021-06-11 14:00"),
                        "endDate": new Date("2021-06-11 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing Deployment tests on Dev environment 11-04",
                    },
                    {
                        "id": "4b6d2182-1c3b-4c13-b687-00bcb85aff9c",
                        "startDate": new Date("2021-06-11 15:00"),
                        "endDate": new Date("2021-06-11 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 11-01",
                    },
                    {
                        "id": "f514f942-515d-4f53-bef4-5d53fd7145c0",
                        "startDate": new Date("2021-06-11 16:00"),
                        "endDate": new Date("2021-06-11 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 11-02",
                    },
                    {
                        "id": "506449c9-7ccf-4f14-9f35-03f7826aa0f3",
                        "startDate": new Date("2021-06-11 17:00"),
                        "endDate": new Date("2021-06-11 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 11-03",
                    },
                    {
                        "id": "8d3f3b32-9f0f-4cf3-9eef-70579b9b0386",
                        "startDate": new Date("2021-06-11 18:00"),
                        "endDate": new Date("2021-06-11 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 11-04",
                    },
                    {
                        "id": "746fc6bf-c632-43f5-9c47-dc50bd1e7da7",
                        "startDate": new Date("2021-06-11 19:00"),
                        "endDate": new Date("2021-06-11 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking to PullRequests and think if i made the same solution if i had the ticket to do 11-05",
                    },
                    {
                        "id": "eaedd56d-a211-4cde-8977-4966aaf12e63",
                        "startDate": new Date("2021-06-14 10:00"),
                        "endDate": new Date("2021-06-14 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer NSQ dev environment 14-01",
                    },
                    {
                        "id": "518a6649-0a9f-4840-84f7-c9ad746faccb",
                        "startDate": new Date("2021-06-14 11:00"),
                        "endDate": new Date("2021-06-14 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer NSQ dev environment 14-02",
                    },
                    {
                        "id": "3822a415-0491-4c6c-a7ab-e08c046faae8",
                        "startDate": new Date("2021-06-14 12:00"),
                        "endDate": new Date("2021-06-14 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer NSQ dev environment 14-03",
                    },
                    {
                        "id": "7a6dc9ad-a73f-4023-8825-ab0de21f8ee3",
                        "startDate": new Date("2021-06-14 14:00"),
                        "endDate": new Date("2021-06-14 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer NSQ dev environment 14-04",
                    },
                    {
                        "id": "3fb76c89-3fc6-47b9-997e-228d1b29cdb8",
                        "startDate": new Date("2021-06-14 15:00"),
                        "endDate": new Date("2021-06-14 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer NSQ dev environment 14-01",
                    },
                    {
                        "id": "d71a7173-7c20-4005-83cd-f962fb437f4f",
                        "startDate": new Date("2021-06-14 16:00"),
                        "endDate": new Date("2021-06-14 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer NSQ dev environment 14-02",
                    },
                    {
                        "id": "93272c83-e85f-4bb8-8d56-f1ffff75a12d",
                        "startDate": new Date("2021-06-14 17:00"),
                        "endDate": new Date("2021-06-14 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer NSQ dev environment 14-03",
                    },
                    {
                        "id": "280466db-5240-43ef-9b34-99869baa447f",
                        "startDate": new Date("2021-06-14 18:00"),
                        "endDate": new Date("2021-06-14 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer NSQ dev environment 14-04",
                    },
                    {
                        "id": "388d6b0f-831e-40ea-80a8-f4d0eb3777dd",
                        "startDate": new Date("2021-06-14 19:00"),
                        "endDate": new Date("2021-06-14 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer NSQ dev environment 14-05",
                    },
                    {
                        "id": "45f12d30-374a-4792-96f5-81302ed974c2",
                        "startDate": new Date("2021-06-15 10:00"),
                        "endDate": new Date("2021-06-15 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer MBus dev environment 15-01",
                    },
                    {
                        "id": "a6470139-b843-4d3f-9990-7754fdf6cd57",
                        "startDate": new Date("2021-06-15 11:00"),
                        "endDate": new Date("2021-06-15 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer MBus dev environment 15-02",
                    },
                    {
                        "id": "1a10760d-f7ed-4f04-a5ab-6d4b7b444ab2",
                        "startDate": new Date("2021-06-15 12:00"),
                        "endDate": new Date("2021-06-15 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer MBus dev environment 15-03",
                    },
                    {
                        "id": "08e8b33f-13e3-440e-beb7-6ad0b0f84687",
                        "startDate": new Date("2021-06-15 14:00"),
                        "endDate": new Date("2021-06-15 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises- deploy consumer MBus dev environment 15-04",
                    },
                    {
                        "id": "52ada6ac-4e01-4978-b6f1-15283d26a995",
                        "startDate": new Date("2021-06-15 15:00"),
                        "endDate": new Date("2021-06-15 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer MBus dev environment 15-01",
                    },
                    {
                        "id": "ee2eed66-d5c2-4819-b874-2551695bfeb7",
                        "startDate": new Date("2021-06-15 16:00"),
                        "endDate": new Date("2021-06-15 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer MBus dev environment 15-02",
                    },
                    {
                        "id": "bcd76124-0daa-4850-aedf-b89fa40f1b95",
                        "startDate": new Date("2021-06-15 17:00"),
                        "endDate": new Date("2021-06-15 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer MBus dev environment 15-03",
                    },
                    {
                        "id": "12f08d1d-38ed-491d-ac0b-a2a4831039ce",
                        "startDate": new Date("2021-06-15 18:00"),
                        "endDate": new Date("2021-06-15 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer MBus dev environment 15-04",
                    },
                    {
                        "id": "ba015fc5-7e12-4a90-98c0-441081f8b97f",
                        "startDate": new Date("2021-06-15 19:00"),
                        "endDate": new Date("2021-06-15 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Golang Abbott exercises - deploy producer MBus dev environment 15-05",
                    },
                    {
                        "id": "21a99aa2-1bdc-4f3d-aac4-8fe4f5a43cbd",
                        "startDate": new Date("2021-06-16 10:00"),
                        "endDate": new Date("2021-06-16 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 16-01",
                    },
                    {
                        "id": "382b906c-0452-4487-aa20-ebe54429f190",
                        "startDate": new Date("2021-06-16 11:00"),
                        "endDate": new Date("2021-06-16 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 16-02",
                    },
                    {
                        "id": "deb10076-3e03-4fdb-9794-46a23832fe0f",
                        "startDate": new Date("2021-06-16 12:00"),
                        "endDate": new Date("2021-06-16 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 16-03",
                    },
                    {
                        "id": "60380262-99d2-4748-8703-9b0d5ae39531",
                        "startDate": new Date("2021-06-16 14:00"),
                        "endDate": new Date("2021-06-16 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 16-01",
                    },
                    {
                        "id": "9fcf6a71-4fa1-4f81-b84c-a5938fb3a1fa",
                        "startDate": new Date("2021-06-16 15:00"),
                        "endDate": new Date("2021-06-16 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 16-02",
                    },
                    {
                        "id": "ad21b1cd-df1c-430b-8fc4-3252ec1f763d",
                        "startDate": new Date("2021-06-16 16:00"),
                        "endDate": new Date("2021-06-16 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 16-03",
                    },
                    {
                        "id": "b6ec681a-f9e2-489a-8e93-70493cfa8432",
                        "startDate": new Date("2021-06-16 17:00"),
                        "endDate": new Date("2021-06-16 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 16-04",
                    },
                    {
                        "id": "118b0097-d105-4e06-bb0f-3d1df5dc151c",
                        "startDate": new Date("2021-06-16 18:00"),
                        "endDate": new Date("2021-06-16 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 16-05",
                    },
                    {
                        "id": "cd70ad15-b5eb-4397-bc70-451aa6024820",
                        "startDate": new Date("2021-06-16 19:00"),
                        "endDate": new Date("2021-06-16 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 16-06",
                    },
                    {
                        "id": "945fd6f0-f4af-47f5-9201-bb054a2a64c6",
                        "startDate": new Date("2021-06-17 10:00"),
                        "endDate": new Date("2021-06-17 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 17-01",
                    },
                    {
                        "id": "5d607540-ebe2-4a0f-8a26-f53d67f528d0",
                        "startDate": new Date("2021-06-17 11:00"),
                        "endDate": new Date("2021-06-17 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 17-02",
                    },
                    {
                        "id": "a0219449-a4b9-4340-9bdf-dd03d735cb5b",
                        "startDate": new Date("2021-06-17 12:00"),
                        "endDate": new Date("2021-06-17 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 17-03",
                    },
                    {
                        "id": "910badce-9754-4a0a-90cc-b68ef11008f9",
                        "startDate": new Date("2021-06-17 14:00"),
                        "endDate": new Date("2021-06-17 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 17-04",
                    },
                    {
                        "id": "10b04905-c229-49e0-b8a6-ff7542f7e4d8",
                        "startDate": new Date("2021-06-17 15:00"),
                        "endDate": new Date("2021-06-17 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 17-05",
                    },
                    {
                        "id": "a2a959d9-1718-4b77-bf3c-e8998de439db",
                        "startDate": new Date("2021-06-17 16:00"),
                        "endDate": new Date("2021-06-17 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 17-01",
                    },
                    {
                        "id": "cb9dfb04-27a1-4e8c-b3ac-1a66f9475597",
                        "startDate": new Date("2021-06-17 17:00"),
                        "endDate": new Date("2021-06-17 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 17-02",
                    },
                    {
                        "id": "7f890b30-391b-407d-bcdc-9bb931af2b2e",
                        "startDate": new Date("2021-06-17 18:00"),
                        "endDate": new Date("2021-06-17 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 17-03",
                    },
                    {
                        "id": "a366eb7f-512f-4592-8f32-21df3d274c04",
                        "startDate": new Date("2021-06-17 19:00"),
                        "endDate": new Date("2021-06-17 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 17-04",
                    },
                    {
                        "id": "07fdadf5-506d-4828-b1b8-81fe508984a0",
                        "startDate": new Date("2021-06-18 10:00"),
                        "endDate": new Date("2021-06-18 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 18-01",
                    },
                    {
                        "id": "fa80890d-6318-4bb1-9b3a-6a9c65660d03",
                        "startDate": new Date("2021-06-18 11:00"),
                        "endDate": new Date("2021-06-18 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 18-02",
                    },
                    {
                        "id": "0695e31a-0b5c-4dd1-9a36-0531fdfcca36",
                        "startDate": new Date("2021-06-18 12:00"),
                        "endDate": new Date("2021-06-18 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 18-03",
                    },
                    {
                        "id": "f3a82fe8-b8f8-4ead-8a49-d0dc818301e9",
                        "startDate": new Date("2021-06-18 14:00"),
                        "endDate": new Date("2021-06-18 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 18-01",
                    },
                    {
                        "id": "fd70c098-14f7-495c-97c9-5de0d183e8aa",
                        "startDate": new Date("2021-06-18 15:00"),
                        "endDate": new Date("2021-06-18 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 18-02",
                    },
                    {
                        "id": "427da43d-cf5c-40e7-8672-57ae2b056b9b",
                        "startDate": new Date("2021-06-18 16:00"),
                        "endDate": new Date("2021-06-18 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 18-03",
                    },
                    {
                        "id": "69edd3d0-e354-4b09-8c27-d4aa062d464c",
                        "startDate": new Date("2021-06-18 17:00"),
                        "endDate": new Date("2021-06-18 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 18-04",
                    },
                    {
                        "id": "156e4419-bcaa-4936-b1cb-313dc6b8f5c4",
                        "startDate": new Date("2021-06-18 18:00"),
                        "endDate": new Date("2021-06-18 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 18-05",
                    },
                    {
                        "id": "4dbf5975-0aee-41af-9149-5c15c3d544cf",
                        "startDate": new Date("2021-06-18 19:00"),
                        "endDate": new Date("2021-06-18 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 18-06",
                    },
                    {
                        "id": "6a86ffee-bd46-4998-9ff6-82828698d4e8",
                        "startDate": new Date("2021-06-21 10:00"),
                        "endDate": new Date("2021-06-21 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-01",
                    },
                    {
                        "id": "4ee3c2a8-eb2a-45eb-b88c-b5543ffb0534",
                        "startDate": new Date("2021-06-21 11:00"),
                        "endDate": new Date("2021-06-21 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-02",
                    },
                    {
                        "id": "613716d0-65e2-481b-a5a4-112f511ba0e9",
                        "startDate": new Date("2021-06-21 12:00"),
                        "endDate": new Date("2021-06-21 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-03",
                    },
                    {
                        "id": "b8a21f49-5c90-4972-9432-5f2aebe653ac",
                        "startDate": new Date("2021-06-21 14:00"),
                        "endDate": new Date("2021-06-21 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-04",
                    },
                    {
                        "id": "84db3a79-6e2b-46a1-97ea-a69fc71d32f7",
                        "startDate": new Date("2021-06-21 15:00"),
                        "endDate": new Date("2021-06-21 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-05",
                    },
                    {
                        "id": "efd9b6c6-5f20-4e60-9b15-362ed0afc75a",
                        "startDate": new Date("2021-06-21 16:00"),
                        "endDate": new Date("2021-06-21 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-06",
                    },
                    {
                        "id": "9c4827e5-5468-457d-b91a-57b41ada5f02",
                        "startDate": new Date("2021-06-21 17:00"),
                        "endDate": new Date("2021-06-21 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-07",
                    },
                    {
                        "id": "f1ecbd65-ea3f-4285-9106-ab9d6888fa25",
                        "startDate": new Date("2021-06-21 18:00"),
                        "endDate": new Date("2021-06-21 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-08",
                    },
                    {
                        "id": "f5d7b330-f48e-456c-bb1b-f7b7cc4a3e8b",
                        "startDate": new Date("2021-06-21 19:00"),
                        "endDate": new Date("2021-06-21 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service 21-09",
                    },
                    {
                        "id": "4f19248f-67ff-49d1-a5f0-24997af3d63a",
                        "startDate": new Date("2021-06-22 10:00"),
                        "endDate": new Date("2021-06-22 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Review Pull Request ADC 10124 22-01",
                    },
                    {
                        "id": "a7fda24d-0de5-4e90-a07c-af16f104eb81",
                        "startDate": new Date("2021-06-22 11:00"),
                        "endDate": new Date("2021-06-22 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Review Pull Request ADC 10124 22-02",
                    },
                    {
                        "id": "4ff91f29-579d-4423-b339-bd55f58c60bd",
                        "startDate": new Date("2021-06-22 12:00"),
                        "endDate": new Date("2021-06-22 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Review Pull Request ADC 10124 22-03",
                    },
                    {
                        "id": "160379d4-0701-488d-ab2b-83c17f5a3cba",
                        "startDate": new Date("2021-06-22 14:00"),
                        "endDate": new Date("2021-06-22 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Review Pull Request ADC 10124 22-04",
                    },
                    {
                        "id": "7ee02cfb-2661-4fcb-a8ed-cb78ee5f2ba4",
                        "startDate": new Date("2021-06-22 15:00"),
                        "endDate": new Date("2021-06-22 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Review Pull Request ADC 10124 22-05",
                    },
                    {
                        "id": "8e48b351-57ea-4b9b-87fb-d7e3b8368d52",
                        "startDate": new Date("2021-06-22 16:00"),
                        "endDate": new Date("2021-06-22 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying base-service phoenix network 22-01",
                    },
                    {
                        "id": "87533432-a761-4a6b-bf9b-44a149b4440f",
                        "startDate": new Date("2021-06-22 17:00"),
                        "endDate": new Date("2021-06-22 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying base-service phoenix network 22-02",
                    },
                    {
                        "id": "cd75b32b-bc19-49ae-855b-b19813445f82",
                        "startDate": new Date("2021-06-22 18:00"),
                        "endDate": new Date("2021-06-22 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying base-service phoenix network 22-03",
                    },
                    {
                        "id": "80db2cf0-4144-43a0-b558-c362c6e55957",
                        "startDate": new Date("2021-06-22 19:00"),
                        "endDate": new Date("2021-06-22 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying base-service phoenix network 22-04",
                    },
                    {
                        "id": "26f3a65b-5689-45ce-a41a-849227854f0d",
                        "startDate": new Date("2021-06-23 10:00"),
                        "endDate": new Date("2021-06-23 11:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-01.5",
                    },
                    {
                        "id": "d8f2f28a-7aae-41b7-be56-01e9aa5b2d64",
                        "startDate": new Date("2021-06-23 11:30"),
                        "endDate": new Date("2021-06-23 12:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-02",
                    },
                    {
                        "id": "6347d3c2-8810-470b-9292-29526142c72f",
                        "startDate": new Date("2021-06-23 13:30"),
                        "endDate": new Date("2021-06-23 14:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-03",
                    },
                    {
                        "id": "8d82e2ba-5621-465d-834f-d21ea6c5325d",
                        "startDate": new Date("2021-06-23 14:30"),
                        "endDate": new Date("2021-06-23 15:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-04",
                    },
                    {
                        "id": "44a9d2ac-4376-4289-a1ad-e52f1aa935ca",
                        "startDate": new Date("2021-06-23 15:30"),
                        "endDate": new Date("2021-06-23 16:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-05",
                    },
                    {
                        "id": "3b817efc-0cbb-4f29-8673-530f156c5954",
                        "startDate": new Date("2021-06-23 16:30"),
                        "endDate": new Date("2021-06-23 17:30"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-06",
                    },
                    {
                        "id": "75485c4c-bcdd-4af3-b199-9e16c62b1444",
                        "startDate": new Date("2021-06-23 18:00"),
                        "endDate": new Date("2021-06-23 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-07",
                    },
                    {
                        "id": "aca39795-b9ae-48e3-acc2-fb14efad7f75",
                        "startDate": new Date("2021-06-23 19:00"),
                        "endDate": new Date("2021-06-23 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 23-08",
                    },
                    {
                        "id": "78963c05-5d72-435f-82ce-83c7078bc1c8",
                        "startDate": new Date("2021-06-23 17:30"),
                        "endDate": new Date("2021-06-23 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "HPP 23-05",
                    },
                    {
                        "id": "2b70fa3c-8006-4075-b60c-3f9df185fc0a",
                        "startDate": new Date("2021-06-24 10:00"),
                        "endDate": new Date("2021-06-24 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-01",
                    },
                    {
                        "id": "60b8b05d-13eb-45c5-ad13-ae9775aa83be",
                        "startDate": new Date("2021-06-24 11:00"),
                        "endDate": new Date("2021-06-24 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-02",
                    },
                    {
                        "id": "20327de5-1b33-4c53-a641-cfbcb003cbf2",
                        "startDate": new Date("2021-06-24 12:00"),
                        "endDate": new Date("2021-06-24 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-03",
                    },
                    {
                        "id": "b9156ce4-8fa9-487f-bbf2-094835c4d4c6",
                        "startDate": new Date("2021-06-24 14:00"),
                        "endDate": new Date("2021-06-24 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-04",
                    },
                    {
                        "id": "6bb8bea7-bfc7-4b86-a368-f0685c4daefb",
                        "startDate": new Date("2021-06-24 15:00"),
                        "endDate": new Date("2021-06-24 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-05",
                    },
                    {
                        "id": "b53dde6f-aba9-48b9-b90e-ac687f3b16d5",
                        "startDate": new Date("2021-06-24 16:00"),
                        "endDate": new Date("2021-06-24 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-06",
                    },
                    {
                        "id": "c793e74b-2265-4448-89bb-0815720b1a6b",
                        "startDate": new Date("2021-06-24 17:00"),
                        "endDate": new Date("2021-06-24 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-07",
                    },
                    {
                        "id": "3d1588e7-7f47-4e7a-a237-bb6b69cd646a",
                        "startDate": new Date("2021-06-24 18:00"),
                        "endDate": new Date("2021-06-24 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-08",
                    },
                    {
                        "id": "322d0e5f-3019-4b8c-868a-f6fad47834aa",
                        "startDate": new Date("2021-06-24 19:00"),
                        "endDate": new Date("2021-06-24 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Make project using abbott base-service consumer 24-09",
                    },
                    {
                        "id": "f4658943-8133-4368-9799-604bc0e40538",
                        "startDate": new Date("2021-06-25 10:00"),
                        "endDate": new Date("2021-06-25 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 25-01",
                    },
                    {
                        "id": "7eded79e-10f3-4c33-87a9-baefb9eab8e8",
                        "startDate": new Date("2021-06-25 11:00"),
                        "endDate": new Date("2021-06-25 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 25-02",
                    },
                    {
                        "id": "d3fe7252-f2a5-4b13-8d58-c7462bf145bc",
                        "startDate": new Date("2021-06-25 12:00"),
                        "endDate": new Date("2021-06-25 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Looking Pull Requests - to undestand how make things on the project 25-03",
                    },
                    {
                        "id": "18002136-9986-4986-abe5-1f263654d890",
                        "startDate": new Date("2021-06-25 14:00"),
                        "endDate": new Date("2021-06-25 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 25-01",
                    },
                    {
                        "id": "8c20d1a4-a2bc-409c-9818-f860b7099fa0",
                        "startDate": new Date("2021-06-25 15:00"),
                        "endDate": new Date("2021-06-25 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 25-02",
                    },
                    {
                        "id": "ae694a4d-52dc-4967-810c-a090df2e3d5d",
                        "startDate": new Date("2021-06-25 16:00"),
                        "endDate": new Date("2021-06-25 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 25-03",
                    },
                    {
                        "id": "2a582e22-1797-47f6-bfdf-efd4cd595524",
                        "startDate": new Date("2021-06-25 17:00"),
                        "endDate": new Date("2021-06-25 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 25-04",
                    },
                    {
                        "id": "f8f8321c-002d-48ef-b4bf-690403b4e6e8",
                        "startDate": new Date("2021-06-25 18:00"),
                        "endDate": new Date("2021-06-25 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 25-05",
                    },
                    {
                        "id": "26078123-ab92-4927-8d2e-70148b867908",
                        "startDate": new Date("2021-06-25 19:00"),
                        "endDate": new Date("2021-06-25 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 25-06",
                    },
                    {
                        "id": "c65d4d1f-e5ee-4e47-9c80-a37182d1a3a8",
                        "startDate": new Date("2021-06-28 10:00"),
                        "endDate": new Date("2021-06-28 11:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing deep dive phoenix network consumer 28-03",
                    },
                    {
                        "id": "2c3bc538-d198-47a0-a2d3-4a4c39bf2c63",
                        "startDate": new Date("2021-06-28 11:00"),
                        "endDate": new Date("2021-06-28 12:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing deep dive phoenix network consumer 28-04",
                    },
                    {
                        "id": "378902b0-35fe-4750-a69f-16c0aac5576d",
                        "startDate": new Date("2021-06-28 12:00"),
                        "endDate": new Date("2021-06-28 13:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing deep dive phoenix network consumer 28-05",
                    },
                    {
                        "id": "9bea1df4-2ba2-4994-be2d-8cd7cc2a79d3",
                        "startDate": new Date("2021-06-28 14:00"),
                        "endDate": new Date("2021-06-28 15:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 28-01",
                    },
                    {
                        "id": "8323a4b7-8c72-4804-983d-0dea293f8525",
                        "startDate": new Date("2021-06-28 15:00"),
                        "endDate": new Date("2021-06-28 16:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 28-02",
                    },
                    {
                        "id": "f25cea79-6603-4900-9c27-aa5803626c3a",
                        "startDate": new Date("2021-06-28 16:00"),
                        "endDate": new Date("2021-06-28 17:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 28-03",
                    },
                    {
                        "id": "afc315c0-b19f-475b-b94b-78d814eaa834",
                        "startDate": new Date("2021-06-28 17:00"),
                        "endDate": new Date("2021-06-28 18:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Deploying deep dive phoenix network consumer 28-04",
                    },
                    {
                        "id": "0a341186-3455-47ff-8f52-1964c6f39dbb",
                        "startDate": new Date("2021-06-28 18:00"),
                        "endDate": new Date("2021-06-28 19:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing deep dive phoenix network consumer 28-01",
                    },
                    {
                        "id": "4b256e10-aa00-44a4-88cf-f857338f0be3",
                        "startDate": new Date("2021-06-28 19:00"),
                        "endDate": new Date("2021-06-28 20:00"),
                        "project": "Staff Augmentation",
                        "focalpoint": "Michael Helmick",
                        "workspace": "Abbott",
                        "title": "Training",
                        "description": "Testing deep dive phoenix network consumer 28-02",
                    },
                ]
            }
        }
    }
}
import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';

@Component({
    selector: 'todolist',
    templateUrl: './todo.component.html'
})
export class ToDoComponent {
    public list: ToDo[] = [];
    public editItem: ToDo = new ToDo();
    public modelState: ModelState = new ModelState();
    public popupTitle: string;
    @ViewChild('closeBtn') closeBtn: ElementRef;

    constructor(private http: Http, @Inject('BASE_URL') private baseUrl: string) {
        this.getList();
    }

    public save(): void {
        this.modelState.Clear();

        if (this.modelState.IsValid(this.editItem)) {
            if (this.editItem.UniqueID == 0) {
                this.http.post(this.baseUrl + 'api/todo/', this.editItem).subscribe(
                    result => this.getList(),
                    error => console.error(error)
                );
            } else {
                this.http.put(this.baseUrl + 'api/todo/', this.editItem).subscribe(
                    result => this.getList(),
                    error => console.error(error)
                );
            }

            this.closeBtn.nativeElement.click();
        }
    }

    public markAsDone(item: ToDo): void {
        item.IsCompleted = true;

        this.http.put(this.baseUrl + 'api/todo/' + item.UniqueID, null).subscribe(            
            error => console.error(error)
        );
    }

    public addNewItem(): void {
        this.editItem = new ToDo();
        this.modelState.Clear();
        this.popupTitle = 'Add new Item';
    }

    public edit(item: ToDo): void {
        this.popupTitle = 'Edit Item';
        this.editItem = Object.assign({}, item);
        this.modelState.Clear();
    }

    public delete(id: number): void {
        if (confirm('Are You sure You want to delete the item?')) {
            this.http.delete(this.baseUrl + 'api/todo/' + id).subscribe(
                result => this.getList(),
                error => console.error(error)
            );
        }
    }

    private getList(): void {
        let headers = new Headers({'Accept': 'application/json'});
        let options = new RequestOptions({ headers: headers });

        this.http.get(this.baseUrl + 'api/todo/', options).subscribe(result => {
            this.list = result.json() as ToDo[];
        }, error => console.error(error));
    }
}

class ToDo {
    public UniqueID: number;
    public Title: string;
    public Description: string;
    public CreatedOn: Date;
    public IsCompleted: boolean;

    constructor() {
        this.UniqueID = 0;
    }
}

class ModelState {
    TitleRequired: boolean;
    DescriptionRequired: boolean;

    public Clear(): void {
        this.TitleRequired = false;
        this.DescriptionRequired = false;
    }

    public IsValid(item: ToDo): boolean {
        this.TitleRequired = item.Title == '' || item.Title == undefined;
        this.DescriptionRequired = item.Description == '' || item.Description == undefined;

        return !this.TitleRequired && !this.DescriptionRequired;
    }
}
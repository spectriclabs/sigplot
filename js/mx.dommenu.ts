import common from "./common.js";
import type { MxContext, Menu, MenuItem } from "./types.js";

interface DomMenuOptions {
    itemClass?: string;
}

class DomMenu {
    options: { itemClass: string };
    finalize: (() => void) | undefined;

    private _Mx: MxContext;
    private _container: HTMLElement;
    private _menu: HTMLDivElement;
    private _menuId: string;
    private _items: HTMLLIElement[];
    private _active: HTMLLIElement | null;
    private _moving: boolean;
    private _movingOffsetX: number;
    private _movingOffsetY: number;
    private _moveMenu: ((e: MouseEvent) => void) | null;

    constructor(Mx: MxContext, menu: Menu, options?: DomMenuOptions) {
        this.options = {
            itemClass: "sigplot-menu-item"
        };
        common.update(this.options, options as any);
        this._Mx = Mx;
        this._container = Mx.root;
        this._menu = document.createElement("div");
        const style = "z-index:2;float:left;position:relative;left:" + Mx.xpos + "px;top:" + Mx.ypos + "px;";
        this._menu.classList.add("sigplot-menu");
        const d = new Date();
        this._menuId = "menu-" + d.getSeconds() + d.getMilliseconds();
        this._menu.classList.add(this._menuId);
        this._menu.style.cssText = style;
        this._items = [];
        this._active = null;
        this._moving = false;
        this._movingOffsetX = 0;
        this._movingOffsetY = 0;
        this._moveMenu = null;
        this.setCSS();
        this.createMenu(menu);
    }

    createMenu(menu: Menu): void {
        const self = this;
        const Mx = this._Mx;
        const originalFinalize = menu.finalize;
        menu.finalize = function () {
            self.remove();
            if (originalFinalize) {
                originalFinalize();
            }
        };
        this.finalize = menu.finalize;
        const title = document.createElement("div");
        title.addEventListener("mousedown", function (e: MouseEvent) {
            e.preventDefault();
            self._movingOffsetX = e.offsetX;
            self._movingOffsetY = e.offsetY;
            self._moving = true;
        });
        title.addEventListener("mouseup", function (e: MouseEvent) {
            e.preventDefault();
            self._moving = false;
        });
        self._moveMenu = function (e: MouseEvent) {
            if (self._moving) {
                self._menu.style.position = "fixed";
                self._menu.style.top = e.clientY - self._movingOffsetY + "px";
                self._menu.style.left = e.clientX - self._movingOffsetX + "px";
            }
        };
        document.body.addEventListener("mousemove", self._moveMenu);
        title.classList.add("sigplot-menu-title");
        title.innerText = menu.title;
        this._menu.append(title);
        const list = document.createElement("ul");
        list.classList.add("sigplot-menu-list");
        menu.items.forEach(function (item: MenuItem) {
            const li = self._createMenuItem(item, menu);
            list.append(li);
        });
        this._menu.append(list);
        this._container.append(this._menu);
        this._menu.addEventListener("contextmenu", function (e: Event) {
            e.preventDefault();
            if (self.finalize) {
                self.finalize();
            }
        });
        (Mx as any).menu = self;
        (Mx as any).widget = {
            type: "MENU",
            callback: function (event: any) {
                if (event.type === "mousedown") {
                    if (event.which === 1 || event.which === 2 || event.which === 3) {
                        if (
                            (self._Mx as any).menu === self &&
                            !event.target.classList.contains(self.options.itemClass)
                        ) {
                            if (self.finalize) {
                                self.finalize();
                            }
                        }
                        if (!(self._Mx as any).menu) {
                            if (self.finalize) {
                                self.finalize();
                            }
                        }
                    }
                }
                if (event.type === "mouseup") {
                    self._moving = false;
                }
                if (event.type === "keydown") {
                    self._handleKeyEvents(event);
                }
            }
        };
    }

    private _handleKeyEvents(event: KeyboardEvent): void {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!this._active) {
                this._setActive(this._items[0]);
            } else {
                const target = this._items.indexOf(this._active) + 1;

                if (target > this._items.length - 1) {
                    return; //Last item in the list keep it active
                }
                this._setActive(this._items[target]);
            }
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!this._active) {
                this._setActive(this._items[0]);
            } else {
                const target = this._items.indexOf(this._active) - 1;
                if (target < 0) {
                    return; // First item in the list keep it active
                }
                this._setActive(this._items[target]);
            }
        }

        if (event.key === "Enter") {
            event.preventDefault();
            if (!this._active) {
                this._setActive(this._items[0]);
            }

            const el = this._active;
            if (el) {
                if (el.onclick) {
                    (el.onclick as any).call(el);
                } else {
                    el.click();
                }
            }
        }
    }

    private _setActive(li: HTMLLIElement): void {
        if (this._active) {
            this._clearActive();
        }
        this._active = li;
        li.classList.add("active");
    }

    private _clearActive(): void {
        if (this._active) {
            this._active.classList.remove("active");
        }
        this._active = null;
    }

    private _createMenuItem(item: MenuItem, menu: Menu): HTMLLIElement {
        const self = this;
        const Mx = this._Mx;
        const li = document.createElement("li");
        li.className += " " + self.options.itemClass;
        li.innerText = item.text;
        if (item.style) {
            li.className += " " + item.style;
        }
        if (item.hasOwnProperty("checked")) {
            li.className += " sigplot-menu-checkbox";
            if (item.checked) {
                li.className += " checked";
            }
        }
        li.addEventListener("click", function () {
            self.remove();
            (Mx as any).menu = undefined;
            (Mx as any).widget = null;
            if (item.handler) {
                item.handler();
            } else if (item.menu) {
                let newmenu = item.menu as any;
                if (typeof item.menu === "function") {
                    newmenu = (item.menu as Function)();
                }
                newmenu.finalize = menu.finalize;
                new DomMenu(Mx, newmenu);
            }

            if (!(Mx as any).menu && menu.finalize) {
                menu.finalize();
            }
        });
        li.addEventListener("mouseenter", function (e: MouseEvent) {
            self._setActive(e.target as HTMLLIElement);
        });
        li.addEventListener("mouseleave", function () {
            self._clearActive();
        });
        self._items.push(li);
        return li;
    }

    remove(): void {
        const Mx = this._Mx;
        (Mx as any).menu = undefined;
        (Mx as any).widget = null;
        this._menu.remove();
        if (this._moveMenu) {
            document.body.removeEventListener("mousemove", this._moveMenu);
        }
    }

    setCSS(): void {
        const Mx = this._Mx;
        const font = (Mx as any).font?.font ?? "";
        //This really sucks...... and I hate it. -Sean
        const textContent =
            "" +
            "." +
            this._menuId +
            "{\n" +
            "background-color: " +
            Mx.xwbg +
            ";\n" +
            "font: " +
            font +
            ";\n" +
            "color:" +
            Mx.xwfg +
            "\n" +
            "}   \n" +
            ".sigplot-menu-list {\n" +
            "    margin: 0px;\n" +
            "    list-style: none;\n" +
            "    padding: 0px;\n" +
            "}\n" +
            "." +
            this._menuId +
            ">div {\n" +
            "    cursor: move;\n" +
            "    text-align: center;\n" +
            "    border-bottom: 2px solid " +
            Mx.xwts +
            ";\n" +
            "}\n" +
            "." +
            this._menuId +
            ">ul>li{\n" +
            "    border-top: 2px solid " +
            Mx.bg +
            ";\n" +
            "    background-color: " +
            Mx.xwlo +
            ";\n" +
            "    padding: 1px;\n" +
            "    padding-right: 5px;\n" +
            "    padding-left: 5px;\n" +
            "    cursor:default;\n" +
            "}\n" +
            "." +
            this._menuId +
            ">ul>li.active{\n" +
            "    background-color: " +
            Mx.hi +
            ";\n" +
            "}\n" +
            "." +
            this._menuId +
            " {\n" +
            "    position: relative;\n" +
            "    color: white;\n" +
            "    float: left;\n" +
            "    border-radius: 5px;\n" +
            "    padding: 3px;\n" +
            "    font: " +
            font +
            ";\n" +
            "    color:" +
            Mx.xwfg +
            "\n" +
            "}\n" +
            "." +
            this._menuId +
            ">ul>li.separator {\n" +
            "    background-color: " +
            Mx.xwbs +
            ";\n" +
            "}\n" +
            ".sigplot-menu-checkbox:before{\n" +
            "    margin-right: 3px; \n" +
            "}\n" +
            ".sigplot-menu-checkbox.checked:before {\n" +
            "    content: '\\25b8';\n" +
            "    width: 2px;\n" +
            "    height: 3px;\n" +
            "}\n" +
            ".sigplot-menu-checkbox.checkbox:before {\n" +
            "    content: '\\25A1';\n" +
            "    width: 2px;\n" +
            "    height: 3px;\n" +
            "}\n" +
            ".sigplot-menu-checkbox.checkbox.checked:before {\n" +
            "    content: '\\25A3';\n" +
            "    width: 2px;\n" +
            "    height: 3px;\n" +
            "}\n";

        const existingStyles = this._container.getElementsByTagName("style");
        if (!existingStyles.length) {
            const styleEl = document.createElement("style");
            styleEl.textContent = textContent;
            this._container.appendChild(styleEl);
        } else {
            existingStyles[0].textContent = textContent;
        }
    }
}

export default DomMenu;
